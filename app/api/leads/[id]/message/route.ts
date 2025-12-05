import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOutreach } from '@/lib/prompts/messaging'
import { GrokModel } from '@/lib/grok'
import { applyAutoProgressionRules } from '@/lib/automation/rules'
import { z } from 'zod'

const GenerateMessageSchema = z.object({
  model: z.enum(['grok-3', 'grok-4-fast-reasoning', 'grok-4-fast-non-reasoning']).optional(),
  context: z.object({
    previousInteractions: z.array(z.string()).optional(),
    companyInfo: z.string().optional(),
    painPoints: z.array(z.string()).optional(),
    goals: z.array(z.string()).optional(),
  }).optional(),
})

/**
 * POST /api/leads/[id]/message - Generate personalized outreach message
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
      include: {
        activities: {
          where: { type: 'message' },
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
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
    const { model = 'grok-3', context } = GenerateMessageSchema.parse(body)

    // Prepare lead data
    const leadData = {
      name: lead.name,
      email: lead.email,
      company: lead.company,
      notes: lead.notes,
      metadata: lead.metadata,
      stage: lead.stage,
    }

    // Build context from previous activities if not provided
    let messageContext = context
    if (!messageContext) {
      const previousMessages = lead.activities
        .filter((a) => a.type === 'message')
        .map((a) => a.description)

      messageContext = {
        previousInteractions: previousMessages.length > 0 ? previousMessages : undefined,
      }
    }

    // Generate outreach
    const startTime = Date.now()
    const outreach = await generateOutreach(leadData, messageContext, model as GrokModel)
    const responseTime = Date.now() - startTime

    // Log activity with full context
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        type: 'message',
        description: `Generated outreach message: ${outreach.subjectLine}`,
        timestamp: new Date(),
        grokResponse: JSON.stringify(outreach),
        modelUsed: model,
        input: JSON.stringify({ leadData, context: messageContext }),
        output: JSON.stringify({
          subjectLine: outreach.subjectLine,
          tone: outreach.tone,
          followUpSuggestions: outreach.followUpSuggestions,
        }),
        userTriggered: 'system',
      },
    })

    // Apply auto-progression rules
    await applyAutoProgressionRules(lead.id, 'message_sent')

    return NextResponse.json(
      {
        success: true,
        data: {
          outreach,
          responseTime,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error generating message:', error)

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
        error: error instanceof Error ? error.message : 'Failed to generate message',
      },
      { status: 500 }
    )
  }
}

