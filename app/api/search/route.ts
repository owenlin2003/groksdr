import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/search - Search across leads, companies, notes, and activity history
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const filter = searchParams.get('filter') // 'all', 'company', 'notes', 'activity'
    const stage = searchParams.get('stage')
    const minScore = searchParams.get('minScore')
    const maxScore = searchParams.get('maxScore')

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
        },
        { status: 400 }
      )
    }

    const searchTerm = query.trim().toLowerCase()
    const where: any = {}

    // Apply filters
    if (stage) {
      where.stage = stage
    }

    if (minScore || maxScore) {
      where.score = {}
      if (minScore) {
        where.score.gte = parseInt(minScore)
      }
      if (maxScore) {
        where.score.lte = parseInt(maxScore)
      }
    }

    // Build search conditions based on filter
    // SQLite doesn't support 'insensitive' mode, so we'll filter in JavaScript
    const searchConditions: any[] = []

    // Always search name and email (most common searches)
    searchConditions.push({
      name: {
        contains: searchTerm,
      },
    })
    searchConditions.push({
      email: {
        contains: searchTerm,
      },
    })

    if (!filter || filter === 'all' || filter === 'company') {
      searchConditions.push({
        company: {
          contains: searchTerm,
        },
      })
    }

    if (!filter || filter === 'all' || filter === 'notes') {
      searchConditions.push({
        notes: {
          contains: searchTerm,
        },
      })
    }

    // Add search conditions to where clause
    if (searchConditions.length > 0) {
      where.OR = searchConditions
    }

    // Get leads matching search (case-insensitive filtering done in JS for SQLite)
    const allLeads = await prisma.lead.findMany({
      include: {
        activities: {
          take: 5,
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Apply case-insensitive search filter in JavaScript (SQLite compatibility)
    let filteredLeads = allLeads.filter((lead) => {
      // Apply stage filter if specified
      if (stage && lead.stage !== stage) {
        return false
      }

      // Apply score filters if specified
      if (minScore && (lead.score === null || lead.score < parseInt(minScore))) {
        return false
      }
      if (maxScore && (lead.score === null || lead.score > parseInt(maxScore))) {
        return false
      }

      // Case-insensitive search across name, email, company, notes
      const nameMatch = lead.name.toLowerCase().includes(searchTerm)
      const emailMatch = lead.email.toLowerCase().includes(searchTerm)
      const companyMatch = !filter || filter === 'all' || filter === 'company'
        ? lead.company.toLowerCase().includes(searchTerm)
        : false
      const notesMatch = !filter || filter === 'all' || filter === 'notes'
        ? (lead.notes?.toLowerCase().includes(searchTerm) || false)
        : false

      // Filter activities if activity filter is specified
      if (filter === 'activity' || !filter || filter === 'all') {
        const activityMatch = lead.activities.some((activity) =>
          activity.description.toLowerCase().includes(searchTerm)
        )
        if (activityMatch) {
          return true
        }
      }

      return nameMatch || emailMatch || companyMatch || notesMatch
    })

    // Filter activities to only include matching ones if activity filter is specified
    if (filter === 'activity' || !filter || filter === 'all') {
      filteredLeads = filteredLeads.map((lead) => ({
        ...lead,
        activities: lead.activities.filter((activity) =>
          activity.description.toLowerCase().includes(searchTerm)
        ),
      }))
    }

    // Filter leads by activity if activity filter is specified
    if (filter === 'activity') {
      filteredLeads = filteredLeads.filter((lead) => lead.activities.length > 0)
    }

    // Calculate relevance scores
    const resultsWithRelevance = filteredLeads.map((lead) => {
      let relevanceScore = 0

      // Name match (highest priority)
      if (lead.name.toLowerCase().includes(searchTerm)) {
        relevanceScore += 5
      }

      // Email match
      if (lead.email.toLowerCase().includes(searchTerm)) {
        relevanceScore += 4
      }

      // Company match
      if (lead.company.toLowerCase().includes(searchTerm)) {
        relevanceScore += 3
      }

      // Notes match
      if (lead.notes?.toLowerCase().includes(searchTerm)) {
        relevanceScore += 2
      }

      // Activity match
      if (lead.activities.length > 0) {
        relevanceScore += lead.activities.length
      }

      // Exact matches get bonus
      if (lead.company.toLowerCase() === searchTerm) {
        relevanceScore += 5
      }
      if (lead.name.toLowerCase() === searchTerm) {
        relevanceScore += 3
      }

      return {
        ...lead,
        relevanceScore,
      }
    })

    // Sort by relevance
    resultsWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore)

    return NextResponse.json(
      {
        success: true,
        data: resultsWithRelevance,
        count: resultsWithRelevance.length,
        query: searchTerm,
        filter: filter || 'all',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error searching leads:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search leads',
      },
      { status: 500 }
    )
  }
}

