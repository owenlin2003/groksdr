import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { qualifyLead } from '@/lib/prompts/qualification'
import { GrokModel } from '@/lib/grok'
import { z } from 'zod'

const RescoreSchema = z.object({
  scoringCriteria: z.object({
    companySizeWeight: z.number().min(0).max(10).optional(),
    industryMatchWeight: z.number().min(0).max(10).optional(),
    budgetSignalsWeight: z.number().min(0).max(10).optional(),
    decisionMakerWeight: z.number().min(0).max(10).optional(),
  }).optional(),
  criteriaId: z.string().optional(),
  model: z.enum(['grok-3', 'grok-4-fast-reasoning', 'grok-4-fast-non-reasoning']).optional(),
})

/**
 * POST /api/leads/rescore - Re-score all leads with new criteria
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { scoringCriteria, criteriaId, model = 'grok-3' } = RescoreSchema.parse(body)

    // Get scoring criteria
    let criteria = scoringCriteria
    if (criteriaId) {
      const dbCriteria = await prisma.scoringCriteria.findUnique({
        where: { id: criteriaId },
      })
      if (dbCriteria) {
        criteria = {
          companySizeWeight: dbCriteria.companySizeWeight,
          industryMatchWeight: dbCriteria.industryMatchWeight,
          budgetSignalsWeight: dbCriteria.budgetSignalsWeight,
          decisionMakerWeight: dbCriteria.decisionMakerWeight,
        }
      }
    }

    if (!criteria) {
      // Use default criteria
      const defaultCriteria = await prisma.scoringCriteria.findFirst({
        where: { isDefault: true },
      })
      if (defaultCriteria) {
        criteria = {
          companySizeWeight: defaultCriteria.companySizeWeight,
          industryMatchWeight: defaultCriteria.industryMatchWeight,
          budgetSignalsWeight: defaultCriteria.budgetSignalsWeight,
          decisionMakerWeight: defaultCriteria.decisionMakerWeight,
        }
      } else {
        criteria = {
          companySizeWeight: 1.0,
          industryMatchWeight: 1.0,
          budgetSignalsWeight: 1.0,
          decisionMakerWeight: 1.0,
        }
      }
    }

    // Get all leads
    const leads = await prisma.lead.findMany()

    const results = {
      total: leads.length,
      successful: 0,
      failed: 0,
      updated: [] as Array<{ id: string; oldScore: number | null; newScore: number }>,
      errors: [] as Array<{ id: string; error: string }>,
    }

    // Re-score each lead
    for (const lead of leads) {
      try {
        const leadData = {
          name: lead.name,
          email: lead.email,
          company: lead.company,
          notes: lead.notes,
          metadata: lead.metadata,
        }

        const qualification = await qualifyLead(leadData, criteria, model as GrokModel)

        const oldScore = lead.score

        // Update lead score
        await prisma.lead.update({
          where: { id: lead.id },
          data: { score: qualification.score },
        })

        // Log activity
        await prisma.activity.create({
          data: {
            leadId: lead.id,
            type: 'score_update',
            description: `Re-scored with new criteria: ${oldScore} → ${qualification.score}`,
            grokResponse: JSON.stringify(qualification),
            modelUsed: model,
            input: JSON.stringify({ criteria }),
            output: JSON.stringify({ score: qualification.score }),
            userTriggered: 'system',
          },
        })

        results.successful++
        if (oldScore !== qualification.score) {
          results.updated.push({
            id: lead.id,
            oldScore,
            newScore: qualification.score,
          })
        }
      } catch (error) {
        results.failed++
        results.errors.push({
          id: lead.id,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: results,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error re-scoring leads:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to re-score leads',
      },
      { status: 500 }
    )
  }
}

