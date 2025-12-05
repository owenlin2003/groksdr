import { describe, it, expect } from 'vitest'
import { evaluationDataset, getExpectedScoreRange, getEvaluationDataset } from '../dataset'

describe('Evaluation Dataset', () => {
  it('should have 10 test leads', () => {
    expect(evaluationDataset.length).toBe(10)
  })

  it('should have diverse lead scenarios', () => {
    const companies = evaluationDataset.map((lead) => lead.company)
    expect(new Set(companies).size).toBeGreaterThan(5) // At least 5 unique companies
  })

  it('should have expected score ranges for all leads', () => {
    for (let i = 0; i < evaluationDataset.length; i++) {
      const range = getExpectedScoreRange(i)
      expect(range).toBeDefined()
      expect(range?.min).toBeGreaterThanOrEqual(0)
      expect(range?.max).toBeLessThanOrEqual(100)
      expect(range?.min).toBeLessThanOrEqual(range?.max)
    }
  })

  it('should include high-value leads', () => {
    const highValueLeads = evaluationDataset.filter((lead, idx) => {
      const range = getExpectedScoreRange(idx)
      return range && range.min >= 75
    })
    expect(highValueLeads.length).toBeGreaterThan(0)
  })

  it('should include low-fit leads', () => {
    const lowFitLeads = evaluationDataset.filter((lead, idx) => {
      const range = getExpectedScoreRange(idx)
      return range && range.max <= 40
    })
    expect(lowFitLeads.length).toBeGreaterThan(0)
  })

  it('should have valid email addresses', () => {
    evaluationDataset.forEach((lead) => {
      expect(lead.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    })
  })

  it('should have required fields for all leads', () => {
    evaluationDataset.forEach((lead) => {
      expect(lead.name).toBeDefined()
      expect(lead.email).toBeDefined()
      expect(lead.company).toBeDefined()
    })
  })

  it('getEvaluationDataset should return the dataset', () => {
    const dataset = getEvaluationDataset()
    expect(dataset).toBe(evaluationDataset)
    expect(dataset.length).toBe(10)
  })

  it('should have metadata for most leads', () => {
    const leadsWithMetadata = evaluationDataset.filter((lead) => lead.metadata)
    expect(leadsWithMetadata.length).toBeGreaterThan(5)
  })
})

