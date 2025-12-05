import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreateActivitySchema = z.object({
  type: z.enum(['qualification', 'message', 'stage_change', 'score_update', 'note']),
  description: z.string().min(1),
  grokResponse: z.string().optional().nullable(),
  modelUsed: z.string().optional().nullable(),
  input: z.string().optional().nullable(),
  output: z.string().optional().nullable(),
  userTriggered: z.string().optional().nullable(),
})

/**
 * GET /api/leads/[id]/activities - Get all activities for a lead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify lead exists
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

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const limit = searchParams.get('limit')

    const where: any = { leadId: id }
    if (type) {
      where.type = type
    }

    const activities = await prisma.activity.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
      orderBy: { timestamp: 'desc' },
    })

    return NextResponse.json(
      {
        success: true,
        data: activities,
        count: activities.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching activities:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch activities',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/leads/[id]/activities - Create a new activity for a lead
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify lead exists
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
    const validatedData = CreateActivitySchema.parse(body)

    const activity = await prisma.activity.create({
      data: {
        leadId: id,
        type: validatedData.type,
        description: validatedData.description,
        grokResponse: validatedData.grokResponse || null,
        modelUsed: validatedData.modelUsed || null,
        input: validatedData.input || null,
        output: validatedData.output || null,
        userTriggered: validatedData.userTriggered || null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: activity,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating activity:', error)

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
        error: error instanceof Error ? error.message : 'Failed to create activity',
      },
      { status: 500 }
    )
  }
}

