import { prisma } from '../prisma'

export interface AutoProgressionResult {
  shouldProgress: boolean
  newStage?: string
  reason?: string
}

/**
 * Check if lead should auto-progress based on score
 * Rule: If score > 80 → auto-move from "New" to "Qualified"
 */
export async function checkScoreBasedProgression(
  leadId: string,
  newScore: number
): Promise<AutoProgressionResult> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  })

  if (!lead) {
    return { shouldProgress: false }
  }

  if (lead.stage === 'New' && newScore > 80) {
    return {
      shouldProgress: true,
      newStage: 'Qualified',
      reason: `Score ${newScore} exceeds threshold of 80`,
    }
  }

  return { shouldProgress: false }
}

/**
 * Check if lead should auto-progress after message sent
 * Rule: If message sent → auto-move to "Contacted"
 */
export async function checkMessageBasedProgression(
  leadId: string
): Promise<AutoProgressionResult> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  })

  if (!lead) {
    return { shouldProgress: false }
  }

  // Check if lead is in New or Qualified stage
  if (lead.stage === 'New' || lead.stage === 'Qualified') {
    return {
      shouldProgress: true,
      newStage: 'Contacted',
      reason: 'Message sent to lead',
    }
  }

  return { shouldProgress: false }
}

/**
 * Check if lead should be flagged as stale
 * Rule: If no activity in 7 days → flag as "Stale" (if stage allows)
 */
export async function checkStaleLead(leadId: string): Promise<AutoProgressionResult> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      activities: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  })

  if (!lead) {
    return { shouldProgress: false }
  }

  // Don't mark closed leads as stale
  if (lead.stage === 'Closed') {
    return { shouldProgress: false }
  }

  const lastActivity = lead.activities[0]
  if (!lastActivity) {
    // No activities, check creation date
    const daysSinceCreation = Math.floor(
      (Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceCreation >= 7) {
      return {
        shouldProgress: true,
        newStage: 'Stale',
        reason: `No activity for ${daysSinceCreation} days since creation`,
      }
    }
    return { shouldProgress: false }
  }

  const daysSinceActivity = Math.floor(
    (Date.now() - lastActivity.timestamp.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceActivity >= 7) {
    return {
      shouldProgress: true,
      newStage: 'Stale',
      reason: `No activity for ${daysSinceActivity} days`,
    }
  }

  return { shouldProgress: false }
}

/**
 * Apply auto-progression rules and update lead stage if needed
 */
export async function applyAutoProgressionRules(
  leadId: string,
  trigger: 'score_update' | 'message_sent' | 'stale_check'
): Promise<AutoProgressionResult | null> {
  let result: AutoProgressionResult | null = null

  if (trigger === 'score_update') {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    })
    if (lead?.score) {
      result = await checkScoreBasedProgression(leadId, lead.score)
    }
  } else if (trigger === 'message_sent') {
    result = await checkMessageBasedProgression(leadId)
  } else if (trigger === 'stale_check') {
    result = await checkStaleLead(leadId)
  }

  if (result?.shouldProgress && result.newStage) {
    // Verify stage exists
    const stageExists = await prisma.pipelineStage.findUnique({
      where: { name: result.newStage },
    })

    if (stageExists) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { stage: result.newStage },
      })

      await prisma.activity.create({
        data: {
          leadId,
          type: 'stage_change',
          description: `Auto-progressed to "${result.newStage}": ${result.reason}`,
          userTriggered: 'system',
        },
      })
    }
  }

  return result
}

