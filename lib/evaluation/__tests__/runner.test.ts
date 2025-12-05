import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runEvaluationForModel, EvaluationResult } from '../runner'
import { qualifyLead } from '../../prompts/qualification'
import { prisma } from '../../prisma'

vi.mock('../../prompts/qualification')
vi.mock('../../prisma', () => ({
  prisma: {
    lead: {
      findFirst: vi.fn(),
    },
    evaluationResult: {
      create: vi.fn(),
    },
  },
}))

describe('Evaluation Runner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.lead.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.evaluationResult.create).mockResolvedValue({} as any)
  })

  it('should run evaluation for a model', async () => {
    const mockQualification = {
      score: 85,
      reasoning: 'High-value lead',
      qualificationStatus: 'qualified' as const,
      breakdown: {},
    }

    vi.mocked(qualifyLead).mockResolvedValue(mockQualification)

    const results = await runEvaluationForModel('grok-3', false)

    expect(results.length).toBe(10) // Should evaluate all 10 leads
    expect(results[0].modelVariant).toBe('grok-3')
    expect(results[0].score).toBe(85)
    expect(results[0].qualificationStatus).toBe('qualified')
    expect(results[0].responseTime).toBeGreaterThanOrEqual(0)
  })

  it('should handle errors gracefully', async () => {
    vi.mocked(qualifyLead).mockRejectedValue(new Error('API Error'))

    const results = await runEvaluationForModel('grok-3', false)

    expect(results.length).toBe(10)
    expect(results[0].error).toBeDefined()
    expect(results[0].score).toBeNull()
    expect(results[0].qualificationStatus).toBe('error')
  })

  it('should measure response time', async () => {
    const mockQualification = {
      score: 75,
      reasoning: 'Test',
      qualificationStatus: 'maybe' as const,
      breakdown: {},
    }

    vi.mocked(qualifyLead).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockQualification), 10))
    )

    const results = await runEvaluationForModel('grok-3', false)

    expect(results[0].responseTime).toBeGreaterThanOrEqual(10)
  })

  it('should save to database when requested', async () => {
    const mockQualification = {
      score: 80,
      reasoning: 'Test',
      qualificationStatus: 'qualified' as const,
      breakdown: {},
    }

    vi.mocked(qualifyLead).mockResolvedValue(mockQualification)

    await runEvaluationForModel('grok-3', true)

    expect(prisma.evaluationResult.create).toHaveBeenCalled()
  })
})

