import { z } from 'zod'
import { getGrokClient, GrokModel } from '../grok'

// Schema for scoring criteria
export interface ScoringCriteria {
  companySizeWeight?: number
  industryMatchWeight?: number
  budgetSignalsWeight?: number
  decisionMakerWeight?: number
}

// Schema for lead data input
export interface LeadData {
  name: string
  email: string
  company: string
  notes?: string | null
  metadata?: string | null // JSON string
}

// Schema for qualification response
const QualificationResponseSchema = z.object({
  score: z.number().min(0).max(100),
  reasoning: z.string(),
  qualificationStatus: z.enum(['qualified', 'maybe', 'not_qualified']),
  breakdown: z.object({
    companySize: z.number().optional(),
    industryMatch: z.number().optional(),
    budgetSignals: z.number().optional(),
    decisionMaker: z.number().optional(),
  }).optional(),
})

export type QualificationResponse = z.infer<typeof QualificationResponseSchema>

/**
 * Builds the qualification prompt with dynamic scoring criteria
 */
function buildQualificationPrompt(
  leadData: LeadData,
  scoringCriteria?: ScoringCriteria
): string {
  const criteria = scoringCriteria || {
    companySizeWeight: 1.0,
    industryMatchWeight: 1.0,
    budgetSignalsWeight: 1.0,
    decisionMakerWeight: 1.0,
  }

  // Parse metadata if available
  let metadataObj: Record<string, any> = {}
  if (leadData.metadata) {
    try {
      metadataObj = JSON.parse(leadData.metadata)
    } catch (e) {
      // Ignore parse errors
    }
  }

  const isCustomCriteria = scoringCriteria !== undefined
  const criteriaNote = isCustomCriteria 
    ? '\nNote: You are using CUSTOM scoring criteria weights provided by the user. Make sure to mention this in your reasoning.'
    : ''

  const prompt = `You are an expert Sales Development Representative (SDR) evaluating a lead for qualification.

Lead Information:
- Name: ${leadData.name}
- Email: ${leadData.email}
- Company: ${leadData.company}
${leadData.notes ? `- Notes: ${leadData.notes}` : ''}
${Object.keys(metadataObj).length > 0 ? `- Additional Metadata: ${JSON.stringify(metadataObj, null, 2)}` : ''}

Scoring Criteria Weights:
- Company Size: ${criteria.companySizeWeight}/5
- Industry Match: ${criteria.industryMatchWeight}/5
- Budget Signals: ${criteria.budgetSignalsWeight}/5
- Decision Maker Title: ${criteria.decisionMakerWeight}/5
${criteriaNote}

Evaluate this lead based on the following factors:

1. Company Size (weight: ${criteria.companySizeWeight}):
   - Larger companies (1000+ employees) = higher score
   - Mid-size companies (100-1000) = medium score
   - Small companies (<100) = lower score

2. Industry Match (weight: ${criteria.industryMatchWeight}):
   - Technology, SaaS, Enterprise Software = higher score
   - Finance, Healthcare = medium-high score
   - Retail, Manufacturing = medium score
   - Other industries = lower score

3. Budget Signals (weight: ${criteria.budgetSignalsWeight}):
   - Explicit budget mentions, "enterprise", "large-scale" = higher score
   - "Budget available", "Looking to invest" = medium-high score
   - "Limited budget", "Startup" = lower score
   - No signals = neutral

4. Decision Maker Title (weight: ${criteria.decisionMakerWeight}):
   - C-level (CEO, CTO, CFO, CMO) = highest score
   - VP, Director = high score
   - Manager = medium score
   - Individual contributor = lower score

Calculate a score from 0-100 where:
- 80-100: Highly qualified (qualified)
- 50-79: Potentially qualified (maybe)
- 0-49: Not qualified (not_qualified)

${isCustomCriteria ? `IMPORTANT: In your reasoning, explicitly mention that you are using custom scoring criteria with the weights provided above. For example: "Using your custom criteria (Company Size: ${criteria.companySizeWeight}/5, Budget: ${criteria.budgetSignalsWeight}/5), [lead name] scores [score] because..."` : ''}

Respond with a JSON object in this exact format:
{
  "score": <number 0-100>,
  "reasoning": "<detailed explanation of your evaluation, 2-3 sentences${isCustomCriteria ? ', mentioning the custom criteria weights used' : ''}>",
  "qualificationStatus": "<qualified|maybe|not_qualified>",
  "breakdown": {
    "companySize": <number 0-100>,
    "industryMatch": <number 0-100>,
    "budgetSignals": <number 0-100>,
    "decisionMaker": <number 0-100>
  }
}

Only return the JSON object, no other text.`

  return prompt
}

/**
 * Qualifies a lead using Grok AI with optional custom scoring criteria
 */
export async function qualifyLead(
  leadData: LeadData,
  scoringCriteria?: ScoringCriteria,
  model: GrokModel = 'grok-3'
): Promise<QualificationResponse> {
  const client = getGrokClient()
  const prompt = buildQualificationPrompt(leadData, scoringCriteria)

  try {
    const response = await client.generateText(prompt, model, {
      temperature: 0.3, // Lower temperature for more consistent scoring
      max_tokens: 500,
    })

    // Parse JSON from response (handle cases where response might have markdown code blocks)
    let jsonStr = response.trim()
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(jsonStr)
    return QualificationResponseSchema.parse(parsed)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid qualification response format: ${error.message}`)
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse Grok response as JSON: ${error.message}`)
    }
    throw error
  }
}

