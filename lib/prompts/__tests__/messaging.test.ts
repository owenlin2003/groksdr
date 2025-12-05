import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateOutreach, LeadData, MessagingContext } from '../messaging'
import { getGrokClient } from '../../grok'

vi.mock('../../grok', () => ({
  getGrokClient: vi.fn(),
}))

describe('Personalized Messaging', () => {
  const mockGrokClient = {
    generateText: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getGrokClient).mockReturnValue(mockGrokClient as any)
  })

  it('should generate outreach with all required fields', async () => {
    const leadData: LeadData = {
      name: 'John Smith',
      email: 'john@example.com',
      company: 'TechCorp',
      notes: 'Enterprise client',
      metadata: JSON.stringify({
        companySize: '500-1000',
        industry: 'Technology',
      }),
    }

    const mockResponse = JSON.stringify({
      subjectLine: 'Transform Your Tech Infrastructure',
      emailBody: 'Dear John,\n\nI noticed TechCorp is...',
      followUpSuggestions: ['Follow up in 1 week', 'Send case study'],
      tone: 'professional',
      personalizationNotes: 'Referenced company size and industry',
    })

    mockGrokClient.generateText.mockResolvedValue(mockResponse)

    const result = await generateOutreach(leadData)

    expect(result.subjectLine).toBeDefined()
    expect(result.emailBody).toBeDefined()
    expect(result.followUpSuggestions).toBeDefined()
    expect(result.tone).toBe('professional')
  })

  it('should handle context with previous interactions', async () => {
    const leadData: LeadData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      company: 'StartupCo',
    }

    const context: MessagingContext = {
      previousInteractions: ['Initial contact made', 'Sent product demo'],
      painPoints: ['Scaling challenges'],
      goals: ['Growth acceleration'],
    }

    const mockResponse = JSON.stringify({
      subjectLine: 'Following up on our conversation',
      emailBody: 'Dear Jane...',
      followUpSuggestions: [],
      tone: 'consultative',
    })

    mockGrokClient.generateText.mockResolvedValue(mockResponse)

    const result = await generateOutreach(leadData, context)

    expect(result.subjectLine).toContain('Following up')
    expect(mockGrokClient.generateText).toHaveBeenCalled()
  })

  it('should handle markdown code blocks', async () => {
    const leadData: LeadData = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'TestCorp',
    }

    const mockResponse = '```json\n' + JSON.stringify({
      subjectLine: 'Test Subject',
      emailBody: 'Test body',
      followUpSuggestions: [],
    }) + '\n```'

    mockGrokClient.generateText.mockResolvedValue(mockResponse)

    const result = await generateOutreach(leadData)

    expect(result.subjectLine).toBe('Test Subject')
  })

  it('should throw error on invalid response', async () => {
    const leadData: LeadData = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'TestCorp',
    }

    mockGrokClient.generateText.mockResolvedValue('Invalid JSON')

    await expect(generateOutreach(leadData)).rejects.toThrow()
  })
})

