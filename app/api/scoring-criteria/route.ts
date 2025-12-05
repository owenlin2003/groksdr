import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ScoringCriteriaSchema = z.object({
  companySizeWeight: z.number().min(0).max(10).optional(),
  industryMatchWeight: z.number().min(0).max(10).optional(),
  budgetSignalsWeight: z.number().min(0).max(10).optional(),
  decisionMakerWeight: z.number().min(0).max(10).optional(),
  userId: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
})

/**
 * GET /api/scoring-criteria - Get scoring criteria
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const isDefault = searchParams.get('isDefault')

    const where: any = {}
    if (userId) {
      where.userId = userId
    }
    if (isDefault !== null) {
      where.isDefault = isDefault === 'true'
    }

    const criteria = await prisma.scoringCriteria.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      {
        success: true,
        data: criteria,
        count: criteria.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching scoring criteria:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scoring criteria',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/scoring-criteria - Create new scoring criteria
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ScoringCriteriaSchema.parse(body)

    // If setting as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.scoringCriteria.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    const criteria = await prisma.scoringCriteria.create({
      data: {
        companySizeWeight: validatedData.companySizeWeight ?? 1.0,
        industryMatchWeight: validatedData.industryMatchWeight ?? 1.0,
        budgetSignalsWeight: validatedData.budgetSignalsWeight ?? 1.0,
        decisionMakerWeight: validatedData.decisionMakerWeight ?? 1.0,
        userId: validatedData.userId || null,
        isDefault: validatedData.isDefault ?? false,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: criteria,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating scoring criteria:', error)

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
        error: error instanceof Error ? error.message : 'Failed to create scoring criteria',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/scoring-criteria - Update scoring criteria
 */
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id && !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either id or userId must be provided',
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = ScoringCriteriaSchema.parse(body)

    // Find existing criteria
    const where: any = {}
    if (id) {
      where.id = id
    } else if (userId) {
      where.userId = userId
      where.isDefault = true
    }

    const existing = await prisma.scoringCriteria.findFirst({
      where,
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scoring criteria not found',
        },
        { status: 404 }
      )
    }

    // If setting as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.scoringCriteria.updateMany({
        where: {
          isDefault: true,
          id: { not: existing.id },
        },
        data: { isDefault: false },
      })
    }

    const criteria = await prisma.scoringCriteria.update({
      where: { id: existing.id },
      data: {
        companySizeWeight: validatedData.companySizeWeight ?? existing.companySizeWeight,
        industryMatchWeight: validatedData.industryMatchWeight ?? existing.industryMatchWeight,
        budgetSignalsWeight: validatedData.budgetSignalsWeight ?? existing.budgetSignalsWeight,
        decisionMakerWeight: validatedData.decisionMakerWeight ?? existing.decisionMakerWeight,
        isDefault: validatedData.isDefault ?? existing.isDefault,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: criteria,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating scoring criteria:', error)

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
        error: error instanceof Error ? error.message : 'Failed to update scoring criteria',
      },
      { status: 500 }
    )
  }
}

