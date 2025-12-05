import { z } from 'zod'
import { getGrokClient, GrokModel } from '../grok'

// Schema for lead data input
export interface LeadData {
  name: string
  email: string
  company: string
  notes?: string | null
  metadata?: string | null // JSON string
  stage?: string
}

// Schema for messaging context
export interface MessagingContext {
  previousInteractions?: string[]
  companyInfo?: string
  painPoints?: string[]
  goals?: string[]
}

// Schema for outreach response
const OutreachResponseSchema = z.object({
  subjectLine: z.string(),
  emailBody: z.string(),
  followUpSuggestions: z.array(z.string()).optional(),
  tone: z.enum(['professional', 'casual', 'consultative', 'urgent']).optional(),
  personalizationNotes: z.string().optional(),
})

export type OutreachResponse = z.infer<typeof OutreachResponseSchema>

/**
 * Builds the personalized messaging prompt
 */
function buildMessagingPrompt(
  leadData: LeadData,
  context?: MessagingContext
): string {
  // Parse metadata if available
  let metadataObj: Record<string, any> = {}
  if (leadData.metadata) {
    try {
      metadataObj = JSON.parse(leadData.metadata)
    } catch (e) {
      // Ignore parse errors
    }
  }

  const prompt = `You are an expert Sales Development Representative (SDR) crafting personalized outreach emails.

Lead Information:
- Name: ${leadData.name}
- Email: ${leadData.email}
- Company: ${leadData.company}
${leadData.stage ? `- Current Stage: ${leadData.stage}` : ''}
${leadData.notes ? `- Notes: ${leadData.notes}` : ''}
${Object.keys(metadataObj).length > 0 ? `- Additional Metadata: ${JSON.stringify(metadataObj, null, 2)}` : ''}

${context?.previousInteractions && context.previousInteractions.length > 0
    ? `Previous Interactions:\n${context.previousInteractions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}`
    : 'This is the first outreach to this lead.'
}

${context?.companyInfo ? `Company Information: ${context.companyInfo}` : ''}
${context?.painPoints && context.painPoints.length > 0
    ? `Identified Pain Points:\n${context.painPoints.map((p, idx) => `- ${p}`).join('\n')}`
    : ''}
${context?.goals && context.goals.length > 0
    ? `Identified Goals:\n${context.goals.map((g, idx) => `- ${g}`).join('\n')}`
    : ''}

Create a personalized outreach email that:
1. Addresses the lead by name and demonstrates knowledge of their company
2. Highlights relevant value propositions based on their industry, company size, and role
3. Uses appropriate tone based on the lead's profile (professional for enterprise, more casual for startups)
4. Includes a clear call-to-action
5. Is concise (3-4 paragraphs maximum)
6. Feels authentic and not templated

Consider:
- Their decision-maker title (if available) to tailor the message appropriately
- Company size to adjust the scale of solutions discussed
- Industry to reference relevant challenges or opportunities
- Current pipeline stage to determine urgency and messaging approach

Respond with a JSON object in this exact format:
{
  "subjectLine": "<compelling email subject line, 50 characters or less>",
  "emailBody": "<full email body with proper formatting, including greeting and signature placeholders>",
  "followUpSuggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "tone": "<professional|casual|consultative|urgent>",
  "personalizationNotes": "<brief explanation of personalization elements used>"
}

Only return the JSON object, no other text.`

  return prompt
}

/**
 * Generates personalized outreach content using Grok AI
 */
export async function generateOutreach(
  leadData: LeadData,
  context?: MessagingContext,
  model: GrokModel = 'grok-3'
): Promise<OutreachResponse> {
  const client = getGrokClient()
  const prompt = buildMessagingPrompt(leadData, context)

  try {
    const response = await client.generateText(prompt, model, {
      temperature: 0.7, // Higher temperature for more creative messaging
      max_tokens: 1000,
    })

    // Parse JSON from response (handle cases where response might have markdown code blocks)
    let jsonStr = response.trim()
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(jsonStr)
    return OutreachResponseSchema.parse(parsed)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid outreach response format: ${error.message}`)
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse Grok response as JSON: ${error.message}`)
    }
    throw error
  }
}

