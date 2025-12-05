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
  notes: string | null
  createdAt: string
  activities: Array<{ timestamp: string }>
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStage, setFilterStage] = useState('')

  useEffect(() => {
    fetchLeads()
  }, [filterStage])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStage) params.append('stage', filterStage)
      
      const response = await fetch(`/api/leads?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setLeads(data.data)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchLeads()
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams({ q: searchQuery })
      if (filterStage) params.append('stage', filterStage)
      
      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setLeads(data.data)
      }
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-100 text-gray-600'
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      New: 'bg-blue-100 text-blue-800',
      Qualified: 'bg-purple-100 text-purple-800',
      Contacted: 'bg-yellow-100 text-yellow-800',
      'Meeting Scheduled': 'bg-orange-100 text-orange-800',
      Closed: 'bg-green-100 text-green-800',
      Stale: 'bg-gray-100 text-gray-800',
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <Link
          href="/leads/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          New Lead
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search leads, companies, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
          />
          <button
            onClick={handleSearch}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Search
          </button>
        </div>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
        >
          <option value="">All Stages</option>
          <option value="New">New</option>
          <option value="Qualified">Qualified</option>
          <option value="Contacted">Contacted</option>
          <option value="Meeting Scheduled">Meeting Scheduled</option>
          <option value="Closed">Closed</option>
          <option value="Stale">Stale</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No leads found</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/leads/${lead.id}`}
                  className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {lead.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex gap-2">
                          {lead.score !== null && (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}
                            >
                              Score: {lead.score}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(lead.stage)}`}
                          >
                            {lead.stage}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <p className="truncate">{lead.company}</p>
                        <span className="mx-2">•</span>
                        <p>{lead.email}</p>
                      </div>
                      {lead.notes && (
                        <p className="mt-1 text-sm text-gray-500 truncate">
                          {lead.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

