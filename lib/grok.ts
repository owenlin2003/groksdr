import { z } from 'zod'

const GrokResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.string(),
        content: z.string(),
      }),
      finish_reason: z.string().nullable(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
})

export type GrokResponse = z.infer<typeof GrokResponseSchema>

export type GrokModel = 'grok-3' | 'grok-4-fast-reasoning' | 'grok-4-fast-non-reasoning'

interface GrokClientConfig {
  apiKey: string
  baseUrl?: string
}

class GrokClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: GrokClientConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://api.x.ai/v1'
  }

  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    model: GrokModel = 'grok-3',
    options?: {
      temperature?: number
      max_tokens?: number
    }
  ): Promise<GrokResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens ?? 2048,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Grok API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      return GrokResponseSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid Grok API response: ${error.message}`)
      }
      throw error
    }
  }

  async generateText(
    prompt: string,
    model: GrokModel = 'grok-3',
    options?: {
      temperature?: number
      max_tokens?: number
    }
  ): Promise<string> {
    const response = await this.chatCompletion(
      [{ role: 'user', content: prompt }],
      model,
      options
    )
    return response.choices[0]?.message?.content || ''
  }
}

// Singleton instance
let grokClient: GrokClient | null = null

export function getGrokClient(): GrokClient {
  if (!grokClient) {
    const apiKey = process.env.GROK_API_KEY
    if (!apiKey) {
      throw new Error('GROK_API_KEY environment variable is not set')
    }
    grokClient = new GrokClient({ apiKey })
  }
  return grokClient
}

export { GrokClient }

