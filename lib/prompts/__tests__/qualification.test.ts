import { describe, it, expect, vi, beforeEach } from 'vitest'
import { qualifyLead, LeadData, ScoringCriteria } from '../qualification'
import { getGrokClient } from '../../grok'

// Mock the Grok client
vi.mock('../../grok', () => ({
  getGrokClient: vi.fn(),
  GrokModel: {
    'grok-3': 'grok-3',
    'grok-4-fast-reasoning': 'grok-4-fast-reasoning',
    'grok-4-fast-non-reasoning': 'grok-4-fast-non-reasoning',
  },
}))

describe('Lead Qualification', () => {
  const mockGrokClient = {
    generateText: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getGrokClient).mockReturnValue(mockGrokClient as any)
  })

  it('should qualify a lead with valid response', async () => {
    const leadData: LeadData = {
      name: 'John Smith',
      email: 'john@example.com',
      company: 'TechCorp',
      notes: 'Enterprise client',
      metadata: JSON.stringify({
        companySize: '500-1000',
        industry: 'Technology',
        budget: 'High',
        decisionMaker: 'CTO',
      }),
    }

    const mockResponse = JSON.stringify({
      score: 85,
      reasoning: 'High-value enterprise lead with strong budget signals',
      qualificationStatus: 'qualified',
      breakdown: {
        companySize: 90,
        industryMatch: 85,
        budgetSignals: 90,
        decisionMaker: 80,
      },
    })

    mockGrokClient.generateText.mockResolvedValue(mockResponse)

    const result = await qualifyLead(leadData)

    expect(result.score).toBe(85)
    expect(result.qualificationStatus).toBe('qualified')
    expect(result.reasoning).toContain('High-value')
    expect(result.breakdown).toBeDefined()
  })

  it('should handle scoring criteria', async () => {
    const leadData: LeadData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      company: 'StartupCo',
      notes: 'Early stage',
    }

    const scoringCriteria: ScoringCriteria = {
      companySizeWeight: 2.0,
      industryMatchWeight: 1.5,
      budgetSignalsWeight: 0.5,
      decisionMakerWeight: 1.0,
    }

    const mockResponse = JSON.stringify({
      score: 60,
      reasoning: 'Mid-value lead',
      qualificationStatus: 'maybe',
    })

    mockGrokClient.generateText.mockResolvedValue(mockResponse)

    const result = await qualifyLead(leadData, scoringCriteria)

    expect(result.score).toBe(60)
    expect(mockGrokClient.generateText).toHaveBeenCalled()
    const callArgs = mockGrokClient.generateText.mock.calls[0]
    expect(callArgs[1]).toBe('grok-3')
  })

  it('should handle markdown code blocks in response', async () => {
    const leadData: LeadData = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'TestCorp',
    }

    const mockResponse = '```json\n' + JSON.stringify({
      score: 75,
      reasoning: 'Test reasoning',
      qualificationStatus: 'qualified',
    }) + '\n```'

    mockGrokClient.generateText.mockResolvedValue(mockResponse)

    const result = await qualifyLead(leadData)

    expect(result.score).toBe(75)
    expect(result.qualificationStatus).toBe('qualified')
  })

  it('should throw error on invalid response format', async () => {
    const leadData: LeadData = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'TestCorp',
    }

    mockGrokClient.generateText.mockResolvedValue('Invalid JSON response')

    await expect(qualifyLead(leadData)).rejects.toThrow()
  })

  it('should validate score range', async () => {
    const leadData: LeadData = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'TestCorp',
    }

    const mockResponse = JSON.stringify({
      score: 150, // Invalid: > 100
      reasoning: 'Test',
      qualificationStatus: 'qualified',
    })

    mockGrokClient.generateText.mockResolvedValue(mockResponse)

    await expect(qualifyLead(leadData)).rejects.toThrow()
  })
})

