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
  const [closedCollapsed, setClosedCollapsed] = useState(true)
  const [staleCollapsed, setStaleCollapsed] = useState(true)

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

      <div className="grid grid-cols-4 gap-4">
        {stages.map((stage) => {
          const stageLeads = getLeadsForStage(stage.name)
          const isClosed = stage.name === 'Closed'
          const isStale = stage.name === 'Stale'
          const isCollapsed = (isClosed && closedCollapsed) || (isStale && staleCollapsed)
          
          return (
            <div
              key={stage.id}
              className={`bg-white rounded-lg border border-gray-200 p-5 shadow-sm ${isCollapsed ? 'col-span-1' : ''}`}
            >
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {stage.name}
                    </h2>
                    {(isClosed || isStale) && (
                      <button
                        onClick={() => {
                          if (isClosed) {
                            setClosedCollapsed(!closedCollapsed)
                          } else if (isStale) {
                            setStaleCollapsed(!staleCollapsed)
                          }
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                    {stageLeads.length}
                  </span>
                </div>
                {stage.description && (
                  <p className="text-sm text-gray-500">{stage.description}</p>
                )}
              </div>

              {!isCollapsed ? (
                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-base font-medium text-gray-900 mb-1">{lead.name}</p>
                      <p className="text-sm text-gray-600 mb-2">{lead.email}</p>
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
                    <div className="text-center py-8">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-sm text-gray-400 mt-2">No leads in this stage</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    {stageLeads.length} {stageLeads.length === 1 ? 'lead' : 'leads'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Click arrow to expand</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

