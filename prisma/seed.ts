import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create pipeline stages
  const stages = [
    { name: 'New', order: 1, description: 'Newly added leads' },
    { name: 'Qualified', order: 2, description: 'Qualified leads' },
    { name: 'Contacted', order: 3, description: 'Leads that have been contacted' },
    { name: 'Meeting Scheduled', order: 4, description: 'Leads with scheduled meetings' },
    { name: 'Closed', order: 5, description: 'Closed deals' },
  ]

  for (const stage of stages) {
    await prisma.pipelineStage.upsert({
      where: { name: stage.name },
      update: {},
      create: stage,
    })
  }

  // Create default scoring criteria if it doesn't exist
  const existingCriteria = await prisma.scoringCriteria.findFirst({
    where: { isDefault: true },
  })
  
  if (!existingCriteria) {
    await prisma.scoringCriteria.create({
      data: {
        userId: null,
        companySizeWeight: 1.0,
        industryMatchWeight: 1.0,
        budgetSignalsWeight: 1.0,
        decisionMakerWeight: 1.0,
        isDefault: true,
      },
    })
  }

  // Create sample leads
  const sampleLeads = [
    {
      name: 'John Smith',
      email: 'john.smith@techcorp.com',
      company: 'TechCorp Inc',
      score: 75,
      stage: 'Qualified',
      notes: 'Enterprise client, interested in AI solutions',
      metadata: JSON.stringify({
        companySize: '500-1000',
        industry: 'Technology',
        budget: 'High',
        decisionMaker: 'CTO',
      }),
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@startup.io',
      company: 'StartupIO',
      score: 45,
      stage: 'New',
      notes: 'Early stage startup, limited budget',
      metadata: JSON.stringify({
        companySize: '10-50',
        industry: 'SaaS',
        budget: 'Low',
        decisionMaker: 'Founder',
      }),
    },
    {
      name: 'Michael Chen',
      email: 'mchen@enterprise.com',
      company: 'Enterprise Solutions',
      score: 90,
      stage: 'Contacted',
      notes: 'Large enterprise, strong budget signals',
      metadata: JSON.stringify({
        companySize: '1000+',
        industry: 'Enterprise Software',
        budget: 'Very High',
        decisionMaker: 'VP Engineering',
      }),
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@retail.com',
      company: 'RetailCo',
      score: 60,
      stage: 'New',
      notes: 'Mid-size retail company',
      metadata: JSON.stringify({
        companySize: '200-500',
        industry: 'Retail',
        budget: 'Medium',
        decisionMaker: 'Director',
      }),
    },
    {
      name: 'David Wilson',
      email: 'dwilson@finance.com',
      company: 'FinanceHub',
      score: 85,
      stage: 'Meeting Scheduled',
      notes: 'Finance sector, high-value prospect',
      metadata: JSON.stringify({
        companySize: '500-1000',
        industry: 'Finance',
        budget: 'High',
        decisionMaker: 'CFO',
      }),
    },
  ]

  for (const lead of sampleLeads) {
    await prisma.lead.create({
      data: lead,
    })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

