'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ActivityTimeline from '@/components/ActivityTimeline'

interface Lead {
  id: string
  name: string
  email: string
  company: string
  score: number | null
  stage: string
  notes: string | null
  metadata: string | null
  createdAt: string
  activities: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    grokResponse?: string | null
    modelUsed?: string | null
    input?: string | null
    output?: string | null
    userTriggered?: string | null
  }>
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [qualifying, setQualifying] = useState(false)
  const [generatingMessage, setGeneratingMessage] = useState(false)
  const [newStage, setNewStage] = useState('')
  const [generatedMessage, setGeneratedMessage] = useState<{
    subjectLine: string
    emailBody: string
    followUpSuggestions?: string[]
    tone?: string
  } | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)

  useEffect(() => {
    fetchLead()
  }, [leadId])

  const fetchLead = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leads/${leadId}`)
      const data = await response.json()
      if (data.success) {
        setLead(data.data)
      }
    } catch (error) {
      console.error('Error fetching lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQualify = async () => {
    try {
      setQualifying(true)
      const response = await fetch(`/api/leads/${leadId}/qualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'grok-3' }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchLead()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error qualifying lead:', error)
      alert('Failed to qualify lead')
    } finally {
      setQualifying(false)
    }
  }

  const handleGenerateMessage = async () => {
    try {
      setGeneratingMessage(true)
      const response = await fetch(`/api/leads/${leadId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'grok-3' }),
      })
      const data = await response.json()
      if (data.success) {
        setGeneratedMessage(data.data.outreach)
        setShowMessageModal(true)
        await fetchLead()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error generating message:', error)
      alert('Failed to generate message')
    } finally {
      setGeneratingMessage(false)
    }
  }

  const handleStageChange = async () => {
    if (!newStage) return

    try {
      const response = await fetch(`/api/leads/${leadId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchLead()
        setNewStage('')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating stage:', error)
      alert('Failed to update stage')
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-100 text-gray-600'
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      New: 'bg-blue-100 text-blue-800',
      Qualified: 'bg-purple-100 text-purple-800',
      Contacted: 'bg-yellow-100 text-yellow-800',
      'Meeting Scheduled': 'bg-orange-100 text-orange-800',
      Closed: 'bg-green-100 text-green-800',
      Stale: 'bg-gray-100 text-gray-800',
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading lead...</p>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Lead not found</p>
        <Link href="/leads" className="text-blue-600 hover:text-blue-800">
          Back to Leads
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/leads"
          className="text-blue-600 hover:text-blue-800 text-base font-medium"
        >
          ← Back to Leads
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
              <p className="mt-1 text-base text-gray-500">{lead.company}</p>
            </div>
            <div className="flex gap-2">
              {lead.score !== null && (
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-base font-medium ${getScoreColor(lead.score)}`}
                >
                  Score: {lead.score}
                </span>
              )}
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-base font-medium ${getStageColor(lead.stage)}`}
              >
                {lead.stage}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-base font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-base text-gray-900">{lead.email}</p>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-500">Created</h3>
              <p className="mt-1 text-base text-gray-900">
                {new Date(lead.createdAt).toLocaleDateString()}
              </p>
            </div>
            {lead.notes && (
              <div className="md:col-span-2">
                <h3 className="text-base font-medium text-gray-500">Notes</h3>
                <p className="mt-1 text-base text-gray-900">{lead.notes}</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleQualify}
                disabled={qualifying}
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {qualifying ? 'Qualifying...' : 'Qualify Lead'}
              </button>
              <button
                onClick={handleGenerateMessage}
                disabled={generatingMessage}
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {generatingMessage ? 'Generating...' : 'Generate Message'}
              </button>
              <div className="flex gap-2">
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-3 border"
                >
                  <option value="">Change Stage</option>
                  <option value="New">New</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Meeting Scheduled">Meeting Scheduled</option>
                  <option value="Closed">Closed</option>
                  <option value="Stale">Stale</option>
                </select>
                <button
                  onClick={handleStageChange}
                  disabled={!newStage}
                  className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  Update Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Activity Timeline</h2>
        </div>
        <div className="px-6 py-5">
          {lead.activities.length > 0 ? (
            <ActivityTimeline activities={lead.activities} />
          ) : (
            <p className="text-gray-500 text-base">No activities yet</p>
          )}
        </div>
      </div>

      {showMessageModal && generatedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Generated Outreach Message</h2>
              <button
                onClick={() => {
                  setShowMessageModal(false)
                  setGeneratedMessage(null)
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-500 mb-2">To:</h3>
                <p className="text-base text-gray-900">{lead.email}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-500 mb-2">Subject:</h3>
                <p className="text-base text-gray-900 font-medium">{generatedMessage.subjectLine}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-500 mb-2">Email Body:</h3>
                <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                  <p className="text-base text-gray-900 whitespace-pre-wrap">{generatedMessage.emailBody}</p>
                </div>
              </div>
              {generatedMessage.tone && (
                <div className="mb-6">
                  <h3 className="text-base font-medium text-gray-500 mb-2">Tone:</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {generatedMessage.tone}
                  </span>
                </div>
              )}
              {generatedMessage.followUpSuggestions && generatedMessage.followUpSuggestions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-medium text-gray-500 mb-2">Follow-up Suggestions:</h3>
                  <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
                    {generatedMessage.followUpSuggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Subject: ${generatedMessage.subjectLine}\n\n${generatedMessage.emailBody}`
                  )
                  alert('Message copied to clipboard!')
                }}
                className="inline-flex items-center px-5 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => {
                  setShowMessageModal(false)
                  setGeneratedMessage(null)
                }}
                className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

