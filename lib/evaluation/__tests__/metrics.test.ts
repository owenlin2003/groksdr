import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateVariance, calculateConsistency, calculateAccuracy } from '../metrics'
import { EvaluationResult } from '../runner'

// Mock prisma
vi.mock('../../prisma', () => ({
  prisma: {
    evaluationResult: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

describe('Evaluation Metrics', () => {
  describe('calculateVariance', () => {
    it('should calculate variance correctly', () => {
      const scores = [80, 85, 90, 75, 70]
      const variance = calculateVariance(scores)
      expect(variance).toBeGreaterThan(0)
      expect(variance).toBeLessThan(100)
    })

    it('should return 0 for empty array', () => {
      expect(calculateVariance([])).toBe(0)
    })

    it('should return 0 for single value', () => {
      expect(calculateVariance([85])).toBe(0)
    })

    it('should handle identical scores', () => {
      expect(calculateVariance([80, 80, 80])).toBe(0)
    })
  })

  describe('calculateConsistency', () => {
    it('should return high consistency for similar scores', () => {
      const scores = [80, 81, 79, 80, 81]
      const consistency = calculateConsistency(scores)
      expect(consistency).toBeGreaterThan(90)
    })

    it('should return lower consistency for varied scores', () => {
      const scores = [20, 80, 30, 90, 50]
      const consistency = calculateConsistency(scores)
      expect(consistency).toBeLessThan(50)
    })

    it('should return 0 for empty array', () => {
      expect(calculateConsistency([])).toBe(0)
    })
  })

  describe('calculateAccuracy', () => {
    it('should calculate accuracy correctly', () => {
      const results: EvaluationResult[] = [
        {
          modelVariant: 'grok-3',
          leadIndex: 0,
          leadId: null,
          responseTime: 100,
          score: 85,
          qualificationStatus: 'qualified',
          reasoning: 'Test',
        },
        {
          modelVariant: 'grok-3',
          leadIndex: 1,
          leadId: null,
          responseTime: 100,
          score: 25,
          qualificationStatus: 'not_qualified',
          reasoning: 'Test',
        },
      ]

      const expectedRanges = new Map([
        [0, { min: 80, max: 100 }],
        [1, { min: 0, max: 30 }],
      ])

      const accuracy = calculateAccuracy(results, expectedRanges)
      expect(accuracy).toBe(100) // Both within range
    })

    it('should handle scores outside expected range', () => {
      const results: EvaluationResult[] = [
        {
          modelVariant: 'grok-3',
          leadIndex: 0,
          leadId: null,
          responseTime: 100,
          score: 50, // Outside range 80-100
          qualificationStatus: 'maybe',
          reasoning: 'Test',
        },
      ]

      const expectedRanges = new Map([
        [0, { min: 80, max: 100 }],
      ])

      const accuracy = calculateAccuracy(results, expectedRanges)
      expect(accuracy).toBe(0)
    })

    it('should ignore results with null scores', () => {
      const results: EvaluationResult[] = [
        {
          modelVariant: 'grok-3',
          leadIndex: 0,
          leadId: null,
          responseTime: 100,
          score: null,
          qualificationStatus: 'error',
          reasoning: '',
        },
      ]

      const expectedRanges = new Map([
        [0, { min: 80, max: 100 }],
      ])

      const accuracy = calculateAccuracy(results, expectedRanges)
      expect(accuracy).toBe(0) // No valid results
    })
  })
})

