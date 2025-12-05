import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateStageSchema = z.object({
  stage: z.string().min(1),
})

/**
 * PUT /api/leads/[id]/stage - Update lead pipeline stage
 */
export async function PUT(
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

    const body = await request.json()
    const { stage } = UpdateStageSchema.parse(body)

    // Verify stage exists
    const pipelineStage = await prisma.pipelineStage.findUnique({
      where: { name: stage },
    })

    if (!pipelineStage) {
      return NextResponse.json(
        {
          success: false,
          error: `Pipeline stage "${stage}" not found`,
        },
        { status: 400 }
      )
    }

    // Update lead stage
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { stage },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        type: 'stage_change',
        description: `Stage changed from "${lead.stage}" to "${stage}"`,
        userTriggered: 'system',
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: updatedLead,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating lead stage:', error)

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
        error: error instanceof Error ? error.message : 'Failed to update lead stage',
      },
      { status: 500 }
    )
  }
}

