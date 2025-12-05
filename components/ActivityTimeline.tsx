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
                    {activity.grokResponse && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                          View Grok Response
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(JSON.parse(activity.grokResponse), null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                    {activity.input && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                          View Input
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(JSON.parse(activity.input), null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                    {activity.output && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                          View Output
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(JSON.parse(activity.output), null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
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

