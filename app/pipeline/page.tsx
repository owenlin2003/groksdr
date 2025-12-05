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
        <p className="text-gray-500">Loading pipeline...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Pipeline</h1>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-4 min-w-full">
          {stages.map((stage) => {
            const stageLeads = getLeadsForStage(stage.name)
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {stage.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {stageLeads.length} {stageLeads.length === 1 ? 'lead' : 'leads'}
                  </p>
                  {stage.description && (
                    <p className="text-xs text-gray-400 mt-1">{stage.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  {stageLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="block p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{lead.company}</p>
                      {lead.score !== null && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 ${getScoreColor(lead.score)}`}
                        >
                          Score: {lead.score}
                        </span>
                      )}
                    </Link>
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No leads in this stage
                    </p>
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

