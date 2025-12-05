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
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

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
      setStatusMessage('Starting evaluation... This will test 3 AI models with 10 sample leads (about 1-2 minutes)')
      
      // Use AbortController for timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 180000) // 3 minute timeout
      
      const response = await fetch('/api/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saveToDatabase: true }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setStatusMessage(`Evaluation complete! Tested ${data.data.summary?.totalTests || 0} leads successfully.`)
        await fetchMetrics()
        // Clear status message after 5 seconds
        setTimeout(() => setStatusMessage(null), 5000)
      } else {
        setStatusMessage(`Error: ${data.error || 'Unknown error occurred'}`)
      }
    } catch (error: any) {
      console.error('Error running evaluation:', error)
      if (error.name === 'AbortError') {
        setStatusMessage('Evaluation timed out. This can happen if the API is slow. Please try again or check your API key.')
      } else {
        setStatusMessage(`Failed to run evaluation: ${error.message || 'Network error'}`)
      }
    } finally {
      setRunning(false)
    }
  }

  const getBestModel = () => {
    if (!metrics || metrics.models.length === 0) return null
    
    return metrics.models.reduce((best, current) => {
      const currentScore = current.averageScore * 0.4 + current.accuracy * 0.3 + (100 - current.averageResponseTime / 10) * 0.3
      const bestScore = best.averageScore * 0.4 + best.accuracy * 0.3 + (100 - best.averageResponseTime / 10) * 0.3
      return currentScore > bestScore ? current : best
    })
  }

  const formatModelName = (name: string) => {
    return name.replace('grok-', 'Grok ').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getSpeedLabel = (ms: number) => {
    if (ms < 2000) return { label: 'Very Fast', color: 'text-green-600' }
    if (ms < 4000) return { label: 'Fast', color: 'text-green-500' }
    if (ms < 6000) return { label: 'Moderate', color: 'text-yellow-600' }
    return { label: 'Slow', color: 'text-red-600' }
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600' }
    if (score >= 60) return { label: 'Good', color: 'text-blue-600' }
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-600' }
    return { label: 'Poor', color: 'text-red-600' }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500 text-lg">Loading results...</p>
      </div>
    )
  }

  const bestModel = getBestModel()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Model Performance</h1>
        <p className="text-lg text-gray-600">
          Compare how different AI models perform at qualifying leads and generating messages
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="text-base text-gray-600">
          {metrics && metrics.models.length > 0 && (
            <span>Testing {metrics.models.length} AI models</span>
          )}
        </div>
        <button
          onClick={handleRunEvaluation}
          disabled={running || loading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {running ? 'Testing Models...' : loading ? 'Loading...' : 'Test All Models'}
        </button>
      </div>

      {(running || statusMessage) && (
        <div className={`mb-6 rounded-lg p-4 ${
          running 
            ? 'bg-blue-50 border border-blue-200' 
            : statusMessage?.includes('Error') || statusMessage?.includes('Failed')
            ? 'bg-red-50 border border-red-200'
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-start gap-3">
            {running && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mt-0.5"></div>
            )}
            <div className="flex-1">
              <p className={`text-base font-medium ${
                running 
                  ? 'text-blue-800' 
                  : statusMessage?.includes('Error') || statusMessage?.includes('Failed')
                  ? 'text-red-800'
                  : 'text-green-800'
              }`}>
                {statusMessage || 'Testing all AI models with sample leads. This will take about 1-2 minutes...'}
              </p>
              {running && (
                <p className="text-sm text-blue-600 mt-2">
                  Please wait while we test each model. This process cannot be interrupted.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {metrics && metrics.models.length > 0 && (
        <>
          {bestModel && (
            <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏆</span>
                <h2 className="text-2xl font-bold text-gray-900">Recommended Model</h2>
              </div>
              <p className="text-xl font-semibold text-gray-800 mb-1">
                {formatModelName(bestModel.modelVariant)}
              </p>
              <p className="text-base text-gray-600">
                Best overall performance for lead qualification and message quality
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {metrics.models.map((model) => {
              const isBest = bestModel?.modelVariant === model.modelVariant
              const speed = getSpeedLabel(model.averageResponseTime)
              const score = getScoreLabel(model.averageScore)
              
              return (
                <div
                  key={model.modelVariant}
                  className={`bg-white rounded-lg shadow-lg p-6 border-2 ${
                    isBest ? 'border-green-500' : 'border-gray-200'
                  }`}
                >
                  {isBest && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ⭐ Best Choice
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {formatModelName(model.modelVariant)}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Lead Quality Score</span>
                        <span className={`text-lg font-bold ${score.color}`}>
                          {model.averageScore.toFixed(0)}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            model.averageScore >= 80 ? 'bg-green-500' :
                            model.averageScore >= 60 ? 'bg-blue-500' :
                            model.averageScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${model.averageScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{score.label} lead scoring</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Response Speed</span>
                        <span className={`text-base font-semibold ${speed.color}`}>
                          {speed.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {(model.averageResponseTime / 1000).toFixed(1)} seconds average
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Reliability</span>
                        <span className="text-base font-semibold text-gray-900">
                          {model.accuracy.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Consistent results across different leads
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Tested on {model.totalEvaluations} sample leads
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What These Results Mean</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-medium mb-1">Lead Quality Score</p>
                <p className="text-gray-600">
                  How well the AI identifies promising leads. Higher scores mean better lead detection.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Response Speed</p>
                <p className="text-gray-600">
                  How quickly the AI analyzes and scores leads. Faster means less waiting time.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Reliability</p>
                <p className="text-gray-600">
                  How consistent the AI is. Higher reliability means more predictable results.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Best Choice</p>
                <p className="text-gray-600">
                  The recommended model balances speed, accuracy, and reliability for your sales team.
                </p>
              </div>
            </div>
          </div>

          {metrics.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Tips for Better Results
              </h3>
              <ul className="list-disc list-inside space-y-2 text-base text-blue-800">
                {metrics.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {metrics && metrics.models.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-lg text-gray-600 mb-4">
            No evaluation results yet. Click "Test All Models" to compare AI performance.
          </p>
          <button
            onClick={handleRunEvaluation}
            disabled={running}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {running ? 'Testing...' : 'Test All Models'}
          </button>
        </div>
      )}
    </div>
  )
}

