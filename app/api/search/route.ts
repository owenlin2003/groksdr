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
    const searchConditions: any[] = []

    if (!filter || filter === 'all' || filter === 'company') {
      searchConditions.push({
        company: {
          contains: searchTerm,
          mode: 'insensitive' as const,
        },
      })
    }

    if (!filter || filter === 'all' || filter === 'notes') {
      searchConditions.push({
        notes: {
          contains: searchTerm,
          mode: 'insensitive' as const,
        },
      })
      searchConditions.push({
        name: {
          contains: searchTerm,
          mode: 'insensitive' as const,
        },
      })
    }

    // Add search conditions to where clause
    if (searchConditions.length > 0) {
      where.OR = searchConditions
    }

    // Get leads matching search
    const leads = await prisma.lead.findMany({
      where,
      include: {
        activities: {
          where: filter === 'activity' || !filter || filter === 'all'
            ? {
                OR: [
                  {
                    description: {
                      contains: searchTerm,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              }
            : undefined,
          take: 5,
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter leads by activity if activity filter is specified
    let filteredLeads = leads
    if (filter === 'activity') {
      filteredLeads = leads.filter((lead) => lead.activities.length > 0)
    }

    // Calculate relevance scores
    const resultsWithRelevance = filteredLeads.map((lead) => {
      let relevanceScore = 0

      // Company match
      if (lead.company.toLowerCase().includes(searchTerm)) {
        relevanceScore += 3
      }

      // Name match
      if (lead.name.toLowerCase().includes(searchTerm)) {
        relevanceScore += 2
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

