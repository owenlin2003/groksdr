'use client'

import { useState, useEffect } from 'react'

interface ScoringCriteria {
  companySizeWeight: number
  industryMatchWeight: number
  budgetSignalsWeight: number
  decisionMakerWeight: number
}

interface QualifyLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onQualify: (useCustom: boolean, criteria?: ScoringCriteria, model?: string) => Promise<void>
  leadName: string
}

export default function QualifyLeadModal({
  isOpen,
  onClose,
  onQualify,
  leadName,
}: QualifyLeadModalProps) {
  const [useCustomCriteria, setUseCustomCriteria] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingCriteria, setLoadingCriteria] = useState(true)
  const [model, setModel] = useState('grok-3')
  const [criteria, setCriteria] = useState<ScoringCriteria>({
    companySizeWeight: 5,
    industryMatchWeight: 3,
    budgetSignalsWeight: 3,
    decisionMakerWeight: 4,
  })

  useEffect(() => {
    if (isOpen) {
      fetchDefaultCriteria()
    }
  }, [isOpen])

  const fetchDefaultCriteria = async () => {
    try {
      setLoadingCriteria(true)
      const response = await fetch('/api/scoring-criteria?isDefault=true')
      const data = await response.json()
      if (data.success && data.data.length > 0) {
        const defaultCriteria = data.data[0]
        // Convert 0.2-1.0 multiplier to 1-5 scale for UI
        setCriteria({
          companySizeWeight: Math.round(defaultCriteria.companySizeWeight * 5),
          industryMatchWeight: Math.round(defaultCriteria.industryMatchWeight * 5),
          budgetSignalsWeight: Math.round(defaultCriteria.budgetSignalsWeight * 5),
          decisionMakerWeight: Math.round(defaultCriteria.decisionMakerWeight * 5),
        })
      }
    } catch (error) {
      console.error('Error fetching default criteria:', error)
    } finally {
      setLoadingCriteria(false)
    }
  }

  const handleQualify = async () => {
    setLoading(true)
    try {
      // Convert 1-5 scale to 0.2-1.0 multiplier for API
      const apiCriteria = useCustomCriteria ? {
        companySizeWeight: criteria.companySizeWeight / 5,
        industryMatchWeight: criteria.industryMatchWeight / 5,
        budgetSignalsWeight: criteria.budgetSignalsWeight / 5,
        decisionMakerWeight: criteria.decisionMakerWeight / 5,
      } : undefined
      
      await onQualify(useCustomCriteria, apiCriteria, model)
      onClose()
    } catch (error) {
      console.error('Error qualifying lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateWeight = (key: keyof ScoringCriteria, value: number) => {
    setCriteria((prev) => ({ ...prev, [key]: value }))
  }

  const renderSlider = (label: string, key: keyof ScoringCriteria, value: number) => {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-base font-medium text-gray-700">{label}</label>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900">{value}/5</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-3 w-3 rounded-full ${
                    level <= value ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => updateWeight(key, parseInt(e.target.value))}
          disabled={!useCustomCriteria || loadingCriteria}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((value - 1) / 4) * 100}%, #e5e7eb ${((value - 1) / 4) * 100}%, #e5e7eb 100%)`,
          }}
        />
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Qualify Lead</h2>
          <p className="mt-1 text-base text-gray-600">Qualifying: {leadName}</p>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">
          <div className="mb-6">
            <label className="text-base font-medium text-gray-700 mb-2 block">
              AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={loading}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 border"
            >
              <option value="grok-3">Grok 3</option>
              <option value="grok-4-fast-reasoning">Grok 4 Fast Reasoning</option>
              <option value="grok-4-fast-non-reasoning">Grok 4 Fast Non-Reasoning</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomCriteria}
                onChange={(e) => setUseCustomCriteria(e.target.checked)}
                disabled={loading || loadingCriteria}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-base font-medium text-gray-700">
                Use Custom Scoring Criteria?
              </span>
            </label>
            <p className="mt-1 text-sm text-gray-500 ml-8">
              Adjust the importance of each factor when scoring this lead
            </p>
          </div>

          {useCustomCriteria && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {loadingCriteria ? (
                <p className="text-base text-gray-500">Loading default criteria...</p>
              ) : (
                <>
                  {renderSlider('Company Size Weight', 'companySizeWeight', criteria.companySizeWeight)}
                  {renderSlider('Budget Signals Weight', 'budgetSignalsWeight', criteria.budgetSignalsWeight)}
                  {renderSlider('Decision Maker Weight', 'decisionMakerWeight', criteria.decisionMakerWeight)}
                  {renderSlider('Industry Match Weight', 'industryMatchWeight', criteria.industryMatchWeight)}
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center px-5 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleQualify}
            disabled={loading || loadingCriteria}
            className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Qualifying...' : 'Qualify with Grok →'}
          </button>
        </div>
      </div>
    </div>
  )
}

