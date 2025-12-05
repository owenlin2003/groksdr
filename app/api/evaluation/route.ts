import { NextRequest, NextResponse } from 'next/server'
import { runEvaluation, runEvaluationForModel } from '@/lib/evaluation/runner'
import { calculateEvaluationMetrics, updateScoreConsistency } from '@/lib/evaluation/metrics'
import { GrokModel } from '@/lib/grok'
import { z } from 'zod'

const RunEvaluationSchema = z.object({
  model: z.enum(['grok-3', 'grok-4-fast-reasoning', 'grok-4-fast-non-reasoning']).optional(),
  saveToDatabase: z.boolean().optional().default(true),
})

/**
 * POST /api/evaluation - Run evaluation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { model, saveToDatabase } = RunEvaluationSchema.parse(body)

    let results

    if (model) {
      // Run evaluation for specific model
      const modelResults = await runEvaluationForModel(model as GrokModel, saveToDatabase)
      
      // Update consistency scores
      if (saveToDatabase) {
        await updateScoreConsistency()
      }

      results = {
        model,
        results: modelResults,
        summary: {
          totalLeads: modelResults.length,
          totalTests: modelResults.length,
          successfulTests: modelResults.filter((r) => !r.error).length,
          failedTests: modelResults.filter((r) => r.error).length,
          averageResponseTime:
            modelResults.length > 0
              ? Math.round(
                  modelResults.reduce((sum, r) => sum + r.responseTime, 0) / modelResults.length
                )
              : 0,
          models: [model],
        },
      }
    } else {
      // Run evaluation for all models
      results = await runEvaluation(saveToDatabase)
      
      // Update consistency scores
      if (saveToDatabase) {
        await updateScoreConsistency()
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...results,
          completedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Evaluation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run evaluation',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/evaluation - Get evaluation results and metrics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const model = searchParams.get('model')

    if (model) {
      // Get results for specific model
      const { prisma } = await import('@/lib/prisma')
      const results = await prisma.evaluationResult.findMany({
        where: { modelVariant: model },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to most recent 100
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            model,
            results,
            count: results.length,
          },
        },
        { status: 200 }
      )
    } else {
      // Get metrics for all models
      const metrics = await calculateEvaluationMetrics()
      
      // Get the most recent evaluation timestamp
      const { prisma } = await import('@/lib/prisma')
      const mostRecent = await prisma.evaluationResult.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            ...metrics,
            lastRunAt: mostRecent?.createdAt ? new Date(mostRecent.createdAt).toISOString() : null,
          },
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error fetching evaluation results:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch evaluation results',
      },
      { status: 500 }
    )
  }
}

