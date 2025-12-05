import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/pipeline - Get all pipeline stages
 */
export async function GET(request: NextRequest) {
  try {
    const stages = await prisma.pipelineStage.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(
      {
        success: true,
        data: stages,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching pipeline stages:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pipeline stages',
      },
      { status: 500 }
    )
  }
}

