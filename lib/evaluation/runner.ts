import { prisma } from '../prisma'
import { qualifyLead, LeadData } from '../prompts/qualification'
import { GrokModel } from '../grok'
import { evaluationDataset, getExpectedScoreRange } from './dataset'

export interface EvaluationResult {
  modelVariant: string
  leadIndex: number
  leadId: string | null
  responseTime: number
  score: number | null
  qualificationStatus: string
  reasoning: string
  error?: string
}

export interface EvaluationRun {
  results: EvaluationResult[]
  summary: {
    totalLeads: number
    totalTests: number
    successfulTests: number
    failedTests: number
    averageResponseTime: number
    models: string[]
  }
}

/**
 * Run evaluation for a single lead across all model variants
 */
async function evaluateLead(
  leadData: LeadData,
  leadIndex: number,
  leadId: string | null = null
): Promise<EvaluationResult[]> {
  const models: GrokModel[] = ['grok-3', 'grok-4-fast-reasoning', 'grok-4-fast-non-reasoning']
  const results: EvaluationResult[] = []

  for (const model of models) {
    const startTime = Date.now()
    
    try {
      const qualification = await qualifyLead(leadData, undefined, model)
      const responseTime = Date.now() - startTime

      results.push({
        modelVariant: model,
        leadIndex,
        leadId,
        responseTime,
        score: qualification.score,
        qualificationStatus: qualification.qualificationStatus,
        reasoning: qualification.reasoning,
      })
    } catch (error) {
      const responseTime = Date.now() - startTime
      results.push({
        modelVariant: model,
        leadIndex,
        leadId,
        responseTime,
        score: null,
        qualificationStatus: 'error',
        reasoning: '',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}

/**
 * Run full evaluation across all leads and model variants
 */
export async function runEvaluation(
  saveToDatabase: boolean = true
): Promise<EvaluationRun> {
  const allResults: EvaluationResult[] = []
  const dataset = evaluationDataset

  // Run evaluation for each lead
  for (let i = 0; i < dataset.length; i++) {
    const leadData = dataset[i]
    
    // Try to find existing lead in database by email
    let leadId: string | null = null
    if (saveToDatabase) {
      try {
        const existingLead = await prisma.lead.findFirst({
          where: { email: leadData.email },
        })
        leadId = existingLead?.id || null
      } catch (error) {
        // Ignore database errors, continue without leadId
      }
    }

    const leadResults = await evaluateLead(leadData, i, leadId)
    allResults.push(...leadResults)

    // Save results to database if requested
    if (saveToDatabase) {
      for (const result of leadResults) {
        try {
          await prisma.evaluationResult.create({
            data: {
              modelVariant: result.modelVariant,
              leadId: result.leadId,
              responseTime: result.responseTime,
              score: result.score,
              scoreConsistency: null, // Will be calculated in metrics
              responseQuality: JSON.stringify({
                qualificationStatus: result.qualificationStatus,
                reasoning: result.reasoning,
                error: result.error,
              }),
            },
          })
        } catch (error) {
          console.error(`Failed to save evaluation result: ${error}`)
        }
      }
    }
  }

  // Calculate summary statistics
  const successfulResults = allResults.filter((r) => !r.error)
  const failedResults = allResults.filter((r) => r.error)
  const models = Array.from(new Set(allResults.map((r) => r.modelVariant)))

  const averageResponseTime =
    successfulResults.length > 0
      ? successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length
      : 0

  const summary = {
    totalLeads: dataset.length,
    totalTests: allResults.length,
    successfulTests: successfulResults.length,
    failedTests: failedResults.length,
    averageResponseTime: Math.round(averageResponseTime),
    models,
  }

  return {
    results: allResults,
    summary,
  }
}

/**
 * Run evaluation for a specific model variant only
 */
export async function runEvaluationForModel(
  model: GrokModel,
  saveToDatabase: boolean = true
): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = []
  const dataset = evaluationDataset

  for (let i = 0; i < dataset.length; i++) {
    const leadData = dataset[i]
    
    let leadId: string | null = null
    if (saveToDatabase) {
      try {
        const existingLead = await prisma.lead.findFirst({
          where: { email: leadData.email },
        })
        leadId = existingLead?.id || null
      } catch (error) {
        // Ignore database errors
      }
    }

    const startTime = Date.now()
    
    try {
      const qualification = await qualifyLead(leadData, undefined, model)
      const responseTime = Date.now() - startTime

      results.push({
        modelVariant: model,
        leadIndex: i,
        leadId,
        responseTime,
        score: qualification.score,
        qualificationStatus: qualification.qualificationStatus,
        reasoning: qualification.reasoning,
      })

      if (saveToDatabase) {
        await prisma.evaluationResult.create({
          data: {
            modelVariant: model,
            leadId,
            responseTime,
            score: qualification.score,
            responseQuality: JSON.stringify({
              qualificationStatus: qualification.qualificationStatus,
              reasoning: qualification.reasoning,
            }),
          },
        })
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      results.push({
        modelVariant: model,
        leadIndex: i,
        leadId,
        responseTime,
        score: null,
        qualificationStatus: 'error',
        reasoning: '',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}

