import { prisma } from '../prisma'
import { EvaluationResult } from './runner'
import { getExpectedScoreRange } from './dataset'

export interface ModelMetrics {
  modelVariant: string
  averageResponseTime: number
  averageScore: number
  scoreVariance: number
  scoreConsistency: number
  accuracy: number
  totalEvaluations: number
  successfulEvaluations: number
  failedEvaluations: number
}

export interface EvaluationMetrics {
  models: ModelMetrics[]
  overallAverageResponseTime: number
  overallAccuracy: number
  recommendations: string[]
}

/**
 * Calculate variance of scores
 */
export function calculateVariance(scores: number[]): number {
  if (scores.length === 0) return 0
  
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const squaredDiffs = scores.map((score) => Math.pow(score - mean, 2))
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / scores.length
  
  return variance
}

/**
 * Calculate score consistency (inverse of variance, normalized)
 */
export function calculateConsistency(scores: number[]): number {
  if (scores.length === 0) return 0
  
  const variance = calculateVariance(scores)
  // Normalize consistency: lower variance = higher consistency
  // Scale to 0-100 range
  const consistency = Math.max(0, 100 - (variance / 10))
  
  return Math.round(consistency * 100) / 100
}

/**
 * Calculate accuracy against expected score ranges
 */
export function calculateAccuracy(
  results: EvaluationResult[],
  expectedRanges: Map<number, { min: number; max: number }>
): number {
  let correct = 0
  let total = 0

  for (const result of results) {
    if (result.score === null || result.error) continue

    const expectedRange = expectedRanges.get(result.leadIndex)
    if (!expectedRange) continue

    total++
    if (result.score >= expectedRange.min && result.score <= expectedRange.max) {
      correct++
    }
  }

  return total > 0 ? (correct / total) * 100 : 0
}

/**
 * Calculate metrics for a specific model variant
 */
export async function calculateModelMetrics(
  modelVariant: string
): Promise<ModelMetrics> {
  const results = await prisma.evaluationResult.findMany({
    where: { modelVariant },
    orderBy: { createdAt: 'desc' },
  })

  const scores = results
    .map((r) => r.score)
    .filter((s): s is number => s !== null)

  const responseTimes = results.map((r) => r.responseTime)
  const successful = results.filter((r) => r.score !== null)
  const failed = results.filter((r) => r.score === null)

  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0

  const averageScore =
    scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0

  const variance = calculateVariance(scores)
  const consistency = calculateConsistency(scores)

  // Calculate accuracy against expected ranges
  const expectedRanges = new Map<number, { min: number; max: number }>()
  for (let i = 0; i < 10; i++) {
    const range = getExpectedScoreRange(i)
    if (range) {
      expectedRanges.set(i, { min: range.min, max: range.max })
    }
  }

  // Map results to evaluation results format for accuracy calculation
  const evaluationResults: EvaluationResult[] = results.map((r, idx) => ({
    modelVariant: r.modelVariant,
    leadIndex: idx % 10, // Approximate lead index
    leadId: r.leadId,
    responseTime: r.responseTime,
    score: r.score,
    qualificationStatus: r.responseQuality
      ? JSON.parse(r.responseQuality).qualificationStatus || 'unknown'
      : 'unknown',
    reasoning: r.responseQuality ? JSON.parse(r.responseQuality).reasoning || '' : '',
  }))

  const accuracy = calculateAccuracy(evaluationResults, expectedRanges)

  return {
    modelVariant,
    averageResponseTime: Math.round(averageResponseTime),
    averageScore: Math.round(averageScore * 100) / 100,
    scoreVariance: Math.round(variance * 100) / 100,
    scoreConsistency: Math.round(consistency * 100) / 100,
    accuracy: Math.round(accuracy * 100) / 100,
    totalEvaluations: results.length,
    successfulEvaluations: successful.length,
    failedEvaluations: failed.length,
  }
}

/**
 * Calculate overall evaluation metrics across all models
 */
export async function calculateEvaluationMetrics(): Promise<EvaluationMetrics> {
  const models = ['grok-3', 'grok-4-fast-reasoning', 'grok-4-fast-non-reasoning']
  const modelMetrics: ModelMetrics[] = []

  for (const model of models) {
    const metrics = await calculateModelMetrics(model)
    modelMetrics.push(metrics)
  }

  const overallAverageResponseTime =
    modelMetrics.length > 0
      ? modelMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / modelMetrics.length
      : 0

  const overallAccuracy =
    modelMetrics.length > 0
      ? modelMetrics.reduce((sum, m) => sum + m.accuracy, 0) / modelMetrics.length
      : 0

  const recommendations = generateRecommendations(modelMetrics)

  return {
    models: modelMetrics,
    overallAverageResponseTime: Math.round(overallAverageResponseTime),
    overallAccuracy: Math.round(overallAccuracy * 100) / 100,
    recommendations,
  }
}

/**
 * Generate recommendations for prompt improvements based on metrics
 */
function generateRecommendations(metrics: ModelMetrics[]): string[] {
  const recommendations: string[] = []

  // Find fastest and slowest models
  const sortedBySpeed = [...metrics].sort((a, b) => a.averageResponseTime - b.averageResponseTime)
  const fastest = sortedBySpeed[0]
  const slowest = sortedBySpeed[sortedBySpeed.length - 1]

  if (fastest && slowest && fastest.averageResponseTime < slowest.averageResponseTime * 0.7) {
    const speedup = (slowest.averageResponseTime / fastest.averageResponseTime).toFixed(1)
    recommendations.push(
      `Use ${fastest.modelVariant} for bulk scoring - ${speedup}x faster (${fastest.averageResponseTime}ms vs ${slowest.averageResponseTime}ms)`
    )
  }

  // Find most and least consistent models
  const sortedByConsistency = [...metrics].sort(
    (a, b) => b.scoreConsistency - a.scoreConsistency
  )
  const mostConsistent = sortedByConsistency[0]
  const leastConsistent = sortedByConsistency[sortedByConsistency.length - 1]

  if (
    mostConsistent &&
    leastConsistent &&
    mostConsistent.scoreConsistency > leastConsistent.scoreConsistency + 10
  ) {
    recommendations.push(
      `Use ${mostConsistent.modelVariant} for reliable scoring - ${mostConsistent.scoreConsistency}% consistency vs ${leastConsistent.scoreConsistency}%`
    )
  }

  // Check accuracy
  const sortedByAccuracy = [...metrics].sort((a, b) => b.accuracy - a.accuracy)
  const mostAccurate = sortedByAccuracy[0]

  if (mostAccurate && mostAccurate.accuracy < 70) {
    recommendations.push(
      `Refine prompt - accuracy ${mostAccurate.accuracy.toFixed(1)}% below target (70%+)`
    )
  } else if (mostAccurate && mostAccurate.accuracy >= 70) {
    recommendations.push(
      `Use ${mostAccurate.modelVariant} for production - best accuracy (${mostAccurate.accuracy.toFixed(1)}%)`
    )
  }

  // Check for high variance
  for (const metric of metrics) {
    if (metric.scoreVariance > 400) {
      recommendations.push(
        `Add scoring criteria to ${metric.modelVariant} - variance ${metric.scoreVariance.toFixed(0)} too high`
      )
    }
  }

  // Check for failures
  for (const metric of metrics) {
    if (metric.failedEvaluations > 0) {
      recommendations.push(
        `Fix ${metric.modelVariant} - ${metric.failedEvaluations} failed evaluation${metric.failedEvaluations > 1 ? 's' : ''}`
      )
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('All models are performing well. Current prompt engineering appears effective.')
  }

  return recommendations
}

/**
 * Update score consistency in database for all evaluation results
 */
export async function updateScoreConsistency(): Promise<void> {
  const models = ['grok-3', 'grok-4-fast-reasoning', 'grok-4-fast-non-reasoning']

  for (const model of models) {
    const results = await prisma.evaluationResult.findMany({
      where: { modelVariant: model },
    })

    // Group by leadId to calculate consistency per lead
    const leadGroups = new Map<string | null, number[]>()
    
    for (const result of results) {
      const key = result.leadId || `index_${result.id}`
      if (!leadGroups.has(key)) {
        leadGroups.set(key, [])
      }
      if (result.score !== null) {
        leadGroups.get(key)!.push(result.score)
      }
    }

    // Calculate consistency for each lead and update
    for (const [leadKey, scores] of leadGroups.entries()) {
      if (scores.length > 1) {
        const consistency = calculateConsistency(scores)
        
        // Update all results for this lead with the same consistency
        const leadId = leadKey?.startsWith('index_') ? null : leadKey
        await prisma.evaluationResult.updateMany({
          where: {
            modelVariant: model,
            leadId: leadId,
          },
          data: {
            scoreConsistency: consistency,
          },
        })
      }
    }
  }
}

