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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Pipeline</h1>
        <p className="text-base text-gray-600">Manage your leads across sales stages</p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {stages.map((stage) => {
          const stageLeads = getLeadsForStage(stage.name)
          const isClosed = stage.name === 'Closed'
          const isCollapsed = isClosed && closedCollapsed
          
          return (
            <div
              key={stage.id}
              className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${isCollapsed ? 'col-span-1' : ''}`}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      {stage.name}
                    </h2>
                    {isClosed && (
                      <button
                        onClick={() => setClosedCollapsed(!closedCollapsed)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        title={closedCollapsed ? 'Expand' : 'Collapse'}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${closedCollapsed ? '' : 'rotate-180'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                    {stageLeads.length}
                  </span>
                </div>
                {stage.description && (
                  <p className="text-sm text-gray-500 leading-relaxed">{stage.description}</p>
                )}
              </div>

              {!isCollapsed ? (
                <div className="p-5 space-y-3 min-h-[200px]">
                  {stageLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-150 group"
                    >
                      <p className="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{lead.name}</p>
                      <p className="text-sm text-gray-600 mb-3">{lead.company}</p>
                      {lead.score !== null && (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getScoreColor(lead.score)}`}
                        >
                          Score: {lead.score}
                        </span>
                      )}
                    </Link>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-14 w-14 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-sm text-gray-400 mt-3 font-medium">No leads in this stage</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-base font-semibold text-gray-700">
                    {stageLeads.length} {stageLeads.length === 1 ? 'lead' : 'leads'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Click arrow to expand</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

