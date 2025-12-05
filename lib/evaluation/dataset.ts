import { LeadData } from '../prompts/qualification'

/**
 * Evaluation dataset with diverse lead scenarios
 * Includes high-value, low-fit, ambiguous, and edge cases
 */
export const evaluationDataset: LeadData[] = [
  // High-value enterprise lead
  {
    name: 'Robert Chen',
    email: 'rchen@fortune500.com',
    company: 'Fortune500 Corp',
    notes: 'Enterprise client, actively seeking AI solutions, budget approved',
    metadata: JSON.stringify({
      companySize: '5000+',
      industry: 'Technology',
      budget: 'Very High',
      decisionMaker: 'CTO',
      painPoints: ['scaling infrastructure', 'data management'],
      timeline: 'Q1 2025',
    }),
  },
  // Low-fit startup
  {
    name: 'Jessica Martinez',
    email: 'jessica@tinystartup.io',
    company: 'TinyStartup',
    notes: 'Early stage, bootstrapped, no budget yet',
    metadata: JSON.stringify({
      companySize: '5-10',
      industry: 'SaaS',
      budget: 'None',
      decisionMaker: 'Founder',
      painPoints: ['finding product-market fit'],
      timeline: 'unknown',
    }),
  },
  // Ambiguous mid-market lead
  {
    name: 'Michael Thompson',
    email: 'mthompson@midmarket.com',
    company: 'MidMarket Solutions',
    notes: 'Growing company, evaluating options',
    metadata: JSON.stringify({
      companySize: '200-500',
      industry: 'Professional Services',
      budget: 'Medium',
      decisionMaker: 'Director of Operations',
      painPoints: ['process automation'],
      timeline: 'Q2 2025',
    }),
  },
  // High-value finance sector
  {
    name: 'Sarah Williams',
    email: 'swilliams@financebank.com',
    company: 'FinanceBank International',
    notes: 'Large financial institution, compliance-focused, strong budget signals',
    metadata: JSON.stringify({
      companySize: '2000+',
      industry: 'Finance',
      budget: 'Very High',
      decisionMaker: 'VP of Technology',
      painPoints: ['regulatory compliance', 'risk management'],
      timeline: 'Q1 2025',
    }),
  },
  // Low-fit non-tech industry
  {
    name: 'David Rodriguez',
    email: 'drodriguez@retailco.com',
    company: 'RetailCo Stores',
    notes: 'Traditional retail, limited tech adoption',
    metadata: JSON.stringify({
      companySize: '100-200',
      industry: 'Retail',
      budget: 'Low',
      decisionMaker: 'Store Manager',
      painPoints: ['inventory management'],
      timeline: 'unknown',
    }),
  },
  // High-value healthcare
  {
    name: 'Emily Johnson',
    email: 'ejohnson@healthsystems.com',
    company: 'HealthSystems Medical',
    notes: 'Healthcare provider, HIPAA compliance required, enterprise deal',
    metadata: JSON.stringify({
      companySize: '1000+',
      industry: 'Healthcare',
      budget: 'High',
      decisionMaker: 'CIO',
      painPoints: ['patient data security', 'interoperability'],
      timeline: 'Q2 2025',
    }),
  },
  // Ambiguous manufacturing
  {
    name: 'James Anderson',
    email: 'janderson@manufacturing.com',
    company: 'Manufacturing Inc',
    notes: 'Industrial company, exploring digital transformation',
    metadata: JSON.stringify({
      companySize: '500-1000',
      industry: 'Manufacturing',
      budget: 'Medium-High',
      decisionMaker: 'VP of Engineering',
      painPoints: ['supply chain optimization', 'IoT integration'],
      timeline: 'Q3 2025',
    }),
  },
  // High-value tech startup (unicorn)
  {
    name: 'Alex Kim',
    email: 'akim@unicornstartup.com',
    company: 'UnicornStartup',
    notes: 'Well-funded startup, Series B, aggressive growth plans',
    metadata: JSON.stringify({
      companySize: '500-1000',
      industry: 'Technology',
      budget: 'Very High',
      decisionMaker: 'VP Product',
      painPoints: ['scaling team', 'product velocity'],
      timeline: 'immediate',
    }),
  },
  // Low-fit individual consultant
  {
    name: 'Patricia Brown',
    email: 'pbrown@consulting.com',
    company: 'Brown Consulting',
    notes: 'Solo consultant, minimal needs',
    metadata: JSON.stringify({
      companySize: '1',
      industry: 'Consulting',
      budget: 'Very Low',
      decisionMaker: 'Owner',
      painPoints: ['client management'],
      timeline: 'unknown',
    }),
  },
  // Edge case: Missing metadata
  {
    name: 'Chris Taylor',
    email: 'ctaylor@mystery.com',
    company: 'Mystery Corp',
    notes: 'Limited information available',
    metadata: null,
  },
]

/**
 * Expected scores for evaluation (baseline for comparison)
 * These are approximate targets - actual scores may vary
 */
export const expectedScores: Record<number, { min: number; max: number; reason: string }> = {
  0: { min: 85, max: 100, reason: 'High-value enterprise lead' },
  1: { min: 0, max: 30, reason: 'Low-fit startup with no budget' },
  2: { min: 40, max: 70, reason: 'Ambiguous mid-market lead' },
  3: { min: 80, max: 95, reason: 'High-value finance sector' },
  4: { min: 20, max: 40, reason: 'Low-fit traditional retail' },
  5: { min: 75, max: 90, reason: 'High-value healthcare' },
  6: { min: 50, max: 75, reason: 'Ambiguous manufacturing' },
  7: { min: 85, max: 100, reason: 'High-value well-funded startup' },
  8: { min: 0, max: 25, reason: 'Low-fit solo consultant' },
  9: { min: 30, max: 60, reason: 'Edge case with missing data' },
}

/**
 * Get evaluation dataset with metadata
 */
export function getEvaluationDataset(): LeadData[] {
  return evaluationDataset
}

/**
 * Get expected score range for a lead index
 */
export function getExpectedScoreRange(index: number): { min: number; max: number; reason: string } | null {
  return expectedScores[index] || null
}

