import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreateLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  notes: z.string().optional().nullable(),
  metadata: z.string().optional().nullable(),
  stage: z.string().optional(),
  score: z.number().int().min(0).max(100).optional().nullable(),
})

/**
 * GET /api/leads - Get all leads with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stage = searchParams.get('stage')
    const minScore = searchParams.get('minScore')
    const maxScore = searchParams.get('maxScore')
    const limit = searchParams.get('limit')

    const where: any = {}

    if (stage) {
      where.stage = stage
    }

    if (minScore || maxScore) {
      where.score = {}
      if (minScore) {
        where.score.gte = parseInt(minScore)
      }
      if (maxScore) {
        where.score.lte = parseInt(maxScore)
      }
    }

    const leads = await prisma.lead.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        activities: {
          take: 5,
          orderBy: { timestamp: 'desc' },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: leads,
        count: leads.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching leads:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch leads',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/leads - Create a new lead
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateLeadSchema.parse(body)

    const lead = await prisma.lead.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company,
        notes: validatedData.notes || null,
        metadata: validatedData.metadata || null,
        stage: validatedData.stage || 'New',
        score: validatedData.score || null,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        type: 'note',
        description: 'Lead created',
        userTriggered: 'system',
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: lead,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating lead:', error)

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
        error: error instanceof Error ? error.message : 'Failed to create lead',
      },
      { status: 500 }
    )
  }
}

