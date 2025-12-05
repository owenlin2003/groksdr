import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { qualifyLead } from '@/lib/prompts/qualification'
import { GrokModel } from '@/lib/grok'
import { applyAutoProgressionRules } from '@/lib/automation/rules'
import { z } from 'zod'

const QualifyLeadSchema = z.object({
  model: z.enum(['grok-3', 'grok-4-fast-reasoning', 'grok-4-fast-non-reasoning']).optional(),
  scoringCriteria: z.object({
    companySizeWeight: z.number().optional(),
    industryMatchWeight: z.number().optional(),
    budgetSignalsWeight: z.number().optional(),
    decisionMakerWeight: z.number().optional(),
  }).optional(),
})

/**
 * POST /api/leads/[id]/qualify - Qualify a lead using Grok
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get lead
    const lead = await prisma.lead.findUnique({
      where: { id },
    })

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          error: 'Lead not found',
        },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { model = 'grok-3', scoringCriteria } = QualifyLeadSchema.parse(body)

    // Prepare lead data for qualification
    const leadData = {
      name: lead.name,
      email: lead.email,
      company: lead.company,
      notes: lead.notes,
      metadata: lead.metadata,
    }

    // Get scoring criteria from database if not provided
    let criteria = scoringCriteria
    if (!criteria) {
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
      }
    }

    // Qualify lead
    const startTime = Date.now()
    const qualification = await qualifyLead(leadData, criteria, model as GrokModel)
    const responseTime = Date.now() - startTime

    // Update lead score
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        score: qualification.score,
      },
    })

    // Build simple, readable description
    const statusLabel = qualification.qualificationStatus === 'qualified' ? 'Qualified' 
      : qualification.qualificationStatus === 'maybe' ? 'Maybe Qualified'
      : 'Not Qualified'
    
    const customCriteriaNote = criteria && scoringCriteria 
      ? ' (custom scoring used)'
      : ''
    
    // Create clean, readable description
    const description = `Score: ${qualification.score}/100 - ${statusLabel}${customCriteriaNote}`
    
    // Log activity with full details
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        type: 'qualification',
        description,
        timestamp: new Date(),
        grokResponse: JSON.stringify(qualification),
        modelUsed: model,
        input: JSON.stringify({ leadData, criteria }),
        output: JSON.stringify({ score: qualification.score, status: qualification.qualificationStatus }),
        userTriggered: 'system',
      },
    })

    // Apply auto-progression rules
    await applyAutoProgressionRules(lead.id, 'score_update')

    return NextResponse.json(
      {
        success: true,
        data: {
          lead: updatedLead,
          qualification,
          responseTime,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error qualifying lead:', error)

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
        error: error instanceof Error ? error.message : 'Failed to qualify lead',
      },
      { status: 500 }
    )
  }
}

