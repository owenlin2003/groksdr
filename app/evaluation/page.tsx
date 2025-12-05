'use client'

import { useEffect, useState } from 'react'

interface ModelMetrics {
  modelVariant: string
  averageResponseTime: number
  averageScore: number
  scoreVariance: number
  scoreConsistency: number
  accuracy: number
  totalEvaluations: number
  successfulEvaluations: number
  failedEvaluations: number
}

interface EvaluationMetrics {
  models: ModelMetrics[]
  overallAverageResponseTime: number
  overallAccuracy: number
  recommendations: string[]
}

export default function EvaluationPage() {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/evaluation')
      const data = await response.json()
      if (data.success) {
        setMetrics(data.data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRunEvaluation = async () => {
    try {
      setRunning(true)
      const response = await fetch('/api/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saveToDatabase: true }),
      })
      const data = await response.json()
      if (data.success) {
        alert(`Evaluation complete!\n\nTotal tests: ${data.data.summary.totalTests}\nSuccessful: ${data.data.summary.successfulTests}\nFailed: ${data.data.summary.failedTests}`)
        await fetchMetrics()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error running evaluation:', error)
      alert('Failed to run evaluation')
    } finally {
      setRunning(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading evaluation metrics...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Model Evaluation</h1>
        <button
          onClick={handleRunEvaluation}
          disabled={running}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {running ? 'Running...' : 'Run Evaluation'}
        </button>
      </div>

      {metrics && (
        <>
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Overall Average Response Time</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {metrics.overallAverageResponseTime}ms
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Overall Accuracy</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {metrics.overallAccuracy.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Model Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consistency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.models.map((model) => (
                    <tr key={model.modelVariant}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {model.modelVariant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.averageResponseTime}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.averageScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.scoreConsistency.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.accuracy.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.totalEvaluations > 0
                          ? ((model.successfulEvaluations / model.totalEvaluations) * 100).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {metrics.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Recommendations
              </h3>
              <ul className="list-disc list-inside space-y-2 text-blue-800">
                {metrics.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

