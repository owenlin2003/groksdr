import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  company: z.string().min(1).optional(),
  notes: z.string().optional().nullable(),
  metadata: z.string().optional().nullable(),
  stage: z.string().optional(),
  score: z.number().int().min(0).max(100).optional().nullable(),
})

/**
 * GET /api/leads/[id] - Get a single lead by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { timestamp: 'desc' },
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

    return NextResponse.json(
      {
        success: true,
        data: lead,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching lead:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch lead',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/leads/[id] - Update a lead
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = UpdateLeadSchema.parse(body)

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { id },
    })

    if (!existingLead) {
      return NextResponse.json(
        {
          success: false,
          error: 'Lead not found',
        },
        { status: 404 }
      )
    }

    // Track what changed for activity log
    const changes: string[] = []
    if (validatedData.name && validatedData.name !== existingLead.name) {
      changes.push(`Name: ${existingLead.name} → ${validatedData.name}`)
    }
    if (validatedData.stage && validatedData.stage !== existingLead.stage) {
      changes.push(`Stage: ${existingLead.stage} → ${validatedData.stage}`)
    }
    if (validatedData.score !== undefined && validatedData.score !== existingLead.score) {
      changes.push(`Score: ${existingLead.score} → ${validatedData.score}`)
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: validatedData,
    })

    // Log activity if changes were made
    if (changes.length > 0) {
      await prisma.activity.create({
        data: {
          leadId: lead.id,
          type: 'note',
          description: `Lead updated: ${changes.join(', ')}`,
          userTriggered: 'system',
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        data: lead,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating lead:', error)

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
        error: error instanceof Error ? error.message : 'Failed to update lead',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/leads/[id] - Delete a lead
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    await prisma.lead.delete({
      where: { id },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Lead deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting lead:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete lead',
      },
      { status: 500 }
    )
  }
}

