'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Lead {
  id: string
  name: string
  email: string
  company: string
  score: number | null
  stage: string
}

interface PipelineStage {
  id: string
  name: string
  order: number
  description: string | null
}

export default function PipelinePage() {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPipeline()
  }, [])

  const fetchPipeline = async () => {
    try {
      setLoading(true)
      const [stagesResponse, leadsResponse] = await Promise.all([
        fetch('/api/pipeline'),
        fetch('/api/leads'),
      ])

      const stagesData = await stagesResponse.json()
      const leadsData = await leadsResponse.json()

      if (stagesData.success) {
        setStages(stagesData.data.sort((a: PipelineStage, b: PipelineStage) => a.order - b.order))
      }
      if (leadsData.success) {
        setLeads(leadsData.data)
      }
    } catch (error) {
      console.error('Error fetching pipeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLeadsForStage = (stageName: string) => {
    return leads.filter((lead) => lead.stage === stageName)
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-100 text-gray-600'
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getStageColor = (stageName: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      New: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      Qualified: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
      Contacted: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
      'Meeting Scheduled': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
      Closed: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      Stale: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
    }
    return colors[stageName] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500 text-lg">Loading pipeline...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Pipeline</h1>
        <p className="text-lg text-gray-600">Visualize your leads across sales stages</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-5 min-w-full">
          {stages.map((stage) => {
            const stageLeads = getLeadsForStage(stage.name)
            const stageColors = getStageColor(stage.name)
            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-80 ${stageColors.bg} rounded-xl p-5 border-2 ${stageColors.border} shadow-sm`}
              >
                <div className="mb-5 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className={`text-xl font-bold ${stageColors.text}`}>
                      {stage.name}
                    </h2>
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${stageColors.bg} ${stageColors.text} font-bold text-base border-2 ${stageColors.border}`}>
                      {stageLeads.length}
                    </span>
                  </div>
                  {stage.description && (
                    <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                  )}
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {stageLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-900 mb-1">{lead.name}</p>
                          <p className="text-sm text-gray-600 mb-1">{lead.company}</p>
                          <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                        </div>
                      </div>
                      {lead.score !== null && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getScoreColor(lead.score)}`}
                          >
                            Score: {lead.score}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-base text-gray-400 font-medium">No leads in this stage</p>
                      <p className="text-sm text-gray-400 mt-1">Move leads here to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

