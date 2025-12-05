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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500 text-lg">Loading pipeline...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Pipeline</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stages.map((stage) => {
          const stageLeads = getLeadsForStage(stage.name)
          return (
            <div
              key={stage.id}
              className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm"
            >
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {stage.name}
                  </h2>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                    {stageLeads.length}
                  </span>
                </div>
                {stage.description && (
                  <p className="text-sm text-gray-500">{stage.description}</p>
                )}
              </div>

              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-base font-medium text-gray-900 mb-1">{lead.name}</p>
                    <p className="text-sm text-gray-600 mb-2">{lead.company}</p>
                    {lead.score !== null && (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getScoreColor(lead.score)}`}
                      >
                        Score: {lead.score}
                      </span>
                    )}
                  </Link>
                ))}
                {stageLeads.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No leads in this stage
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

