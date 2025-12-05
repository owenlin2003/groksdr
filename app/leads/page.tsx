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
  activities: Array<{ 
    timestamp: string
    type: string
    description: string
  }>
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [sortBy, setSortBy] = useState('score-desc')

  useEffect(() => {
    if (searchQuery.trim()) {
      // Debounce search - wait 300ms after user stops typing
      const timeoutId = setTimeout(() => {
        performSearch()
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      // If search is empty, fetch all leads
      fetchLeads()
    }
  }, [searchQuery, filterStage])

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

  const performSearch = async () => {
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

  const handleSearch = () => {
    performSearch()
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

  const sortLeads = (leadsToSort: Lead[]) => {
    const sorted = [...leadsToSort]
    
    switch (sortBy) {
      case 'score-desc':
        return sorted.sort((a, b) => {
          const scoreA = a.score ?? -1
          const scoreB = b.score ?? -1
          return scoreB - scoreA
        })
      case 'score-asc':
        return sorted.sort((a, b) => {
          const scoreA = a.score ?? 101
          const scoreB = b.score ?? 101
          return scoreA - scoreB
        })
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case 'company-asc':
        return sorted.sort((a, b) => a.company.localeCompare(b.company))
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      default:
        return sorted
    }
  }

  const sortedLeads = sortLeads(leads)

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    return time.toLocaleDateString()
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      qualification: '✓',
      message: '📧',
      stage_change: '→',
      score_update: '📊',
      note: '📝',
    }
    return icons[type] || '•'
  }

  const getActivityShortDescription = (activity: { type: string; description: string }) => {
    const typeLabels: Record<string, string> = {
      qualification: 'Qualified',
      message: 'Message generated',
      stage_change: 'Stage changed',
      score_update: 'Score updated',
      note: 'Note added',
    }
    return typeLabels[activity.type] || activity.description.split(':')[0] || 'Activity'
  }

  const getLastActivity = (lead: Lead) => {
    if (!lead.activities || lead.activities.length === 0) return null
    return lead.activities[0] // Already sorted by timestamp desc
  }

  const getScoreTrend = (lead: Lead) => {
    if (!lead.activities || lead.activities.length < 2) return null
    const scoreActivities = lead.activities.filter(a => a.type === 'score_update' || a.type === 'qualification')
    if (scoreActivities.length < 2) return null
    
    // Try to extract scores from descriptions
    const scores = scoreActivities.map(a => {
      const match = a.description.match(/score (\d+)/i)
      return match ? parseInt(match[1]) : null
    }).filter(s => s !== null) as number[]
    
    if (scores.length < 2) return null
    const current = scores[0]
    const previous = scores[scores.length - 1]
    const diff = current - previous
    
    if (diff > 0) return { direction: 'up', value: diff }
    if (diff < 0) return { direction: 'down', value: Math.abs(diff) }
    return { direction: 'same', value: 0 }
  }

  const getNextAction = (lead: Lead) => {
    const lastActivity = getLastActivity(lead)
    const daysSinceActivity = lastActivity 
      ? Math.floor((new Date().getTime() - new Date(lastActivity.timestamp).getTime()) / 86400000)
      : Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / 86400000)

    // No activity in 7+ days
    if (daysSinceActivity >= 7) {
      return { text: 'No activity in 7+ days - follow up', color: 'text-orange-600', icon: '⚠️' }
    }

    // High score but not qualified
    if (lead.score !== null && lead.score >= 80 && lead.stage === 'New') {
      return { text: 'Schedule demo call', color: 'text-blue-600', icon: '💡' }
    }

    // Qualified but not contacted
    if (lead.stage === 'Qualified') {
      return { text: 'Send outreach message', color: 'text-blue-600', icon: '💡' }
    }

    // Low score
    if (lead.score !== null && lead.score < 50 && lead.stage !== 'Closed') {
      return { text: 'Re-qualify or nurture', color: 'text-yellow-600', icon: '💡' }
    }

    return null
  }

  const exportToCSV = () => {
    if (sortedLeads.length === 0) {
      alert('No leads to export')
      return
    }

    // CSV headers - only what sales reps need
    const headers = [
      'Name',
      'Email',
      'Company',
      'Score',
      'Stage',
      'Notes',
      'Last Activity',
      'Created Date'
    ]

    // Build each row
    const rows = sortedLeads.map(lead => {
      const lastActivity = getLastActivity(lead)
      const lastActivityText = lastActivity 
        ? `${getActivityShortDescription(lastActivity)} - ${formatTimeAgo(lastActivity.timestamp)}`
        : 'No activity'
      
      return [
        lead.name || '',
        lead.email || '',
        lead.company || '',
        lead.score !== null ? lead.score.toString() : 'N/A',
        lead.stage || '',
        lead.notes || '',
        lastActivityText,
        new Date(lead.createdAt).toLocaleDateString()
      ]
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            disabled={loading || sortedLeads.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
          <Link
            href="/leads/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            New Lead
          </Link>
        </div>
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
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
        >
          <option value="score-desc">Score: High to Low</option>
          <option value="score-asc">Score: Low to High</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
          <option value="company-asc">Company: A to Z</option>
          <option value="date-desc">Date: Newest First</option>
          <option value="date-asc">Date: Oldest First</option>
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
            {sortedLeads.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/leads/${lead.id}`}
                  className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-blue-600 truncate">
                          {lead.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex gap-2">
                          {lead.score !== null && (() => {
                            const trend = getScoreTrend(lead)
                            return (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}
                              >
                                Score: {lead.score}
                                {trend && trend.direction === 'up' && (
                                  <span className="ml-1 text-green-600">↑ (+{trend.value})</span>
                                )}
                                {trend && trend.direction === 'down' && (
                                  <span className="ml-1 text-red-600">↓ (-{trend.value})</span>
                                )}
                              </span>
                            )
                          })()}
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
                      {(() => {
                        const lastActivity = getLastActivity(lead)
                        const nextAction = getNextAction(lead)
                        return (
                          <>
                            {lastActivity && (
                              <div className="mt-1 text-xs text-gray-500">
                                {getActivityIcon(lastActivity.type)} {getActivityShortDescription(lastActivity)} {formatTimeAgo(lastActivity.timestamp)}
                              </div>
                            )}
                            {nextAction && (
                              <div className={`mt-1 text-xs ${nextAction.color}`}>
                                {nextAction.icon} Next: {nextAction.text}
                              </div>
                            )}
                          </>
                        )
                      })()}
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

