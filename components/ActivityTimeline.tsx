'use client'

interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  grokResponse?: string | null
  modelUsed?: string | null
  input?: string | null
  output?: string | null
  userTriggered?: string | null
}

interface ActivityTimelineProps {
  activities: Activity[]
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      qualification: '✓',
      message: '✉',
      stage_change: '→',
      score_update: '📊',
      note: '📝',
    }
    return icons[type] || '•'
  }

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      qualification: 'bg-blue-100 text-blue-800',
      message: 'bg-green-100 text-green-800',
      stage_change: 'bg-purple-100 text-purple-800',
      score_update: 'bg-yellow-100 text-yellow-800',
      note: 'bg-gray-100 text-gray-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {idx !== activities.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(activity.type)}`}
                  >
                    {getActivityIcon(activity.type)}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActivityColor(activity.type)}`}
                      >
                        {activity.type}
                      </span>
                      {activity.modelUsed && (
                        <span className="text-xs text-gray-500">
                          ({activity.modelUsed})
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(activity.timestamp)}
                    </p>
                    {activity.grokResponse && (() => {
                      try {
                        const response = JSON.parse(activity.grokResponse)
                        return (
                          <details className="mt-3">
                            <summary className="text-base text-blue-600 cursor-pointer hover:text-blue-800 font-medium">
                              ▼ View Grok Response
                            </summary>
                            <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-blue-200">
                                {activity.modelUsed && (
                                  <div>
                                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Model</span>
                                    <div className="text-base font-medium text-blue-900 mt-1">{activity.modelUsed}</div>
                                  </div>
                                )}
                                {response.score !== undefined && (
                                  <div>
                                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Score</span>
                                    <div className="text-2xl font-bold text-blue-900 mt-1">{response.score}/100</div>
                                  </div>
                                )}
                                {response.qualificationStatus && (
                                  <div>
                                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Status</span>
                                    <div className="text-base font-medium text-blue-900 mt-1 capitalize">{response.qualificationStatus}</div>
                                  </div>
                                )}
                              </div>
                              {response.reasoning && (
                                <div>
                                  <div className="text-sm font-semibold text-blue-900 mb-2">Reasoning:</div>
                                  <div className="text-base text-blue-800 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded border border-blue-100">
                                    {response.reasoning}
                                  </div>
                                </div>
                              )}
                              {response.breakdown && (
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                  <div className="text-sm font-semibold text-blue-900 mb-2">Score Breakdown:</div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    {response.breakdown.companySize !== undefined && (
                                      <div className="bg-white p-2 rounded border border-blue-100">
                                        <span className="text-blue-700">Company Size: </span>
                                        <span className="font-semibold text-blue-900">{response.breakdown.companySize}</span>
                                      </div>
                                    )}
                                    {response.breakdown.industryMatch !== undefined && (
                                      <div className="bg-white p-2 rounded border border-blue-100">
                                        <span className="text-blue-700">Industry Match: </span>
                                        <span className="font-semibold text-blue-900">{response.breakdown.industryMatch}</span>
                                      </div>
                                    )}
                                    {response.breakdown.budgetSignals !== undefined && (
                                      <div className="bg-white p-2 rounded border border-blue-100">
                                        <span className="text-blue-700">Budget Signals: </span>
                                        <span className="font-semibold text-blue-900">{response.breakdown.budgetSignals}</span>
                                      </div>
                                    )}
                                    {response.breakdown.decisionMaker !== undefined && (
                                      <div className="bg-white p-2 rounded border border-blue-100">
                                        <span className="text-blue-700">Decision Maker: </span>
                                        <span className="font-semibold text-blue-900">{response.breakdown.decisionMaker}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {!response.reasoning && !response.score && (
                                <div className="text-sm text-blue-600">
                                  <pre className="whitespace-pre-wrap">
                                    {JSON.stringify(response, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </details>
                        )
                      } catch (e) {
                        return (
                          <details className="mt-2">
                            <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                              View Grok Response
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                              <pre className="whitespace-pre-wrap">{activity.grokResponse}</pre>
                            </div>
                          </details>
                        )
                      }
                    })()}
                    {activity.input && (() => {
                      try {
                        const input = JSON.parse(activity.input)
                        return (
                          <details className="mt-2">
                            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                              View Input Details
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                              {input.leadData && (
                                <div className="mb-3">
                                  <div className="font-semibold text-gray-700 mb-1">Lead Information:</div>
                                  <div className="text-gray-800 space-y-1 ml-2">
                                    {input.leadData.name && <div>Name: {input.leadData.name}</div>}
                                    {input.leadData.email && <div>Email: {input.leadData.email}</div>}
                                    {input.leadData.company && <div>Company: {input.leadData.company}</div>}
                                    {input.leadData.notes && <div>Notes: {input.leadData.notes}</div>}
                                  </div>
                                </div>
                              )}
                              {input.criteria && (
                                <div>
                                  <div className="font-semibold text-gray-700 mb-1">Scoring Criteria:</div>
                                  <div className="text-gray-800 space-y-1 ml-2">
                                    <div>Company Size: {Math.round((input.criteria.companySizeWeight || 1.0) * 5)}/5</div>
                                    <div>Budget Signals: {Math.round((input.criteria.budgetSignalsWeight || 1.0) * 5)}/5</div>
                                    <div>Decision Maker: {Math.round((input.criteria.decisionMakerWeight || 1.0) * 5)}/5</div>
                                    <div>Industry Match: {Math.round((input.criteria.industryMatchWeight || 1.0) * 5)}/5</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </details>
                        )
                      } catch (e) {
                        return null
                      }
                    })()}
                    {activity.output && (() => {
                      try {
                        const output = JSON.parse(activity.output)
                        return (
                          <details className="mt-2">
                            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                              View Output Summary
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                              {output.score !== undefined && (
                                <div className="mb-2">
                                  <span className="font-semibold text-gray-700">Final Score: </span>
                                  <span className="text-lg font-bold text-gray-900">{output.score}/100</span>
                                </div>
                              )}
                              {output.status && (
                                <div>
                                  <span className="font-semibold text-gray-700">Status: </span>
                                  <span className="text-gray-800 capitalize">{output.status}</span>
                                </div>
                              )}
                            </div>
                          </details>
                        )
                      } catch (e) {
                        return null
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

