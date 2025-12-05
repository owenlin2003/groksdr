# Grok SDR Demo

A production-ready Sales Development Representative system powered by Grok AI. Built to demonstrate how AI can enhance sales prospecting workflows through intelligent lead qualification, personalized outreach generation, and automated pipeline management.

## What This Does

Sales teams deal with dozens of leads daily. The challenge is knowing which ones deserve attention, what to say to them, and where they are in the sales process. This system addresses those questions by using Grok AI to evaluate leads consistently, generate personalized messages, and track progress through a visual pipeline.

The interface is designed for sales professionals, not developers. Every screen prioritizes clarity and actionability over technical complexity.

## Key Features

### Grok API Integration

The system uses Grok's API as its core intelligence layer. All AI-powered features rely on Grok for processing, with optimized prompts specifically tuned for sales use cases. The implementation supports multiple Grok model variants (grok-3, grok-4-fast-reasoning, grok-4-fast-non-reasoning) so you can compare performance and choose what works best.

Error handling is built in at every level. API failures are caught, logged, and presented with clear messages. Response validation ensures Grok's output matches expected formats before it reaches the UI.

### Model Evaluation Framework

Not all AI models perform the same way. This framework lets you systematically compare Grok variants to see which one works best for your specific sales process.

The evaluation system includes a diverse dataset with various lead scenarios—enterprise clients, startups, mid-market companies, and edge cases. It measures accuracy, response speed, reliability (consistency across runs), and lead quality scores. Results appear in a dashboard that shows which model to use, with recommendations based on actual performance data rather than assumptions.

Evaluations complete in under 15 seconds for quick demos, using a focused dataset of high-value and low-fit leads.

### Lead Qualification and Management

AI-Powered Scoring

Each lead receives a score from 0-100 based on four factors: Company Size, Industry Match, Budget Signals, and Decision Maker Title. The scoring weights are customizable. If budget matters more than company size for your process, adjust the sliders on a 1-5 scale and re-score instantly.

Every qualification includes a detailed breakdown showing why a lead scored what it did. This transparency helps sales reps understand the reasoning and build trust in the system.

Pipeline Management

The pipeline view shows all leads organized by stage in a Kanban-style board. Leads automatically progress through stages based on scores and activities—for example, sending a message moves a lead from "New" to "Contacted." The Closed stage is collapsed by default to keep focus on active deals.

Every action is logged in an activity timeline. You can see when a lead was qualified, what messages were sent, when stages changed, and any notes added. This creates a complete audit trail.

Smart Features

The leads list shows last activity timestamps ("Qualified 2 hours ago"), score trends (up arrows for increases, down for decreases), and next action hints ("Schedule demo call" or warnings about inactive leads). These features help sales reps prioritize their time.

CSV export is available with one click, pulling all lead data into a format that works with other sales tools.

### Personalized Messaging

Generic emails get deleted. Personalized ones get responses. The messaging system uses Grok to generate subject lines and email bodies based on lead data—company size, industry, role, previous interactions, and your notes.

Each message includes follow-up suggestions and matches tone to context (professional for enterprise, casual for startups). All messages are automatically logged in the activity timeline so you know what you've sent and when.

### Data Management

Search works in real time as you type, with no button clicking required. It searches across names, emails, companies, notes, and activity history. Stage filtering lets you narrow to specific pipeline stages, and sorting options include score, name, company, and date.

The system uses SQLite with Prisma ORM for data storage. All CRUD operations include validation, and database queries are indexed for performance. The activity history provides a complete audit trail of every action taken.

### User Interface

The interface follows a minimalist design philosophy. Navigation is straightforward: Leads, Pipeline, and Evaluation are the three main sections. The design is responsive and optimized for quick interactions.

Error messages are written in plain language, not technical jargon. When something goes wrong, you'll see what happened and what to do about it.

Key Pages

- Leads Page: List view with search, filtering, sorting, and CSV export
- Lead Detail: Full lead information, qualification controls, message generation, stage management, and activity timeline
- Pipeline: Visual Kanban board showing leads across stages
- Evaluation: Model comparison dashboard with performance metrics

## Technical Architecture

### Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- Backend: Next.js API Routes with Prisma ORM
- Database: SQLite
- AI: Grok API (xAI) with support for multiple model variants
- Testing: Vitest for unit tests
- Deployment: Docker and Docker Compose

### Project Structure

```
grok-sdr-demo/
├── app/                    # Next.js app directory
│   ├── api/               # API route handlers
│   │   ├── leads/         # Lead CRUD, qualification, messaging
│   │   ├── pipeline/      # Pipeline stage management
│   │   ├── evaluation/    # Model evaluation endpoints
│   │   ├── search/        # Search functionality
│   │   └── scoring-criteria/ # Scoring criteria management
│   ├── leads/             # Lead management pages
│   │   ├── [id]/         # Lead detail page
│   │   └── new/          # Create new lead
│   ├── pipeline/          # Pipeline visualization
│   └── evaluation/        # Model evaluation dashboard
├── components/            # Reusable React components
│   ├── ActivityTimeline.tsx
│   └── QualifyLeadModal.tsx
├── lib/                   # Core libraries
│   ├── grok.ts           # Grok API client with error handling
│   ├── api-utils.ts      # API utilities for consistent error handling
│   ├── prompts/          # Prompt engineering
│   │   ├── qualification.ts
│   │   └── messaging.ts
│   ├── evaluation/       # Evaluation framework
│   │   ├── dataset.ts   # Test dataset
│   │   ├── runner.ts    # Evaluation execution
│   │   └── metrics.ts   # Metrics calculation
│   └── automation/       # Auto-progression rules
├── prisma/               # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts
└── public/               # Static assets
```

### Key Components

Grok API Client (lib/grok.ts)

Centralized client handles all API communication with error handling and retry logic. Supports model selection across grok-3, grok-4-fast-reasoning, and grok-4-fast-non-reasoning. Response validation uses Zod schemas to ensure data integrity.

Prompt Engineering (lib/prompts/)

Qualification prompts adapt dynamically to custom scoring criteria. Messaging prompts use lead history and context to generate relevant content. All prompts are structured to produce consistent, parseable responses.

Evaluation Framework (lib/evaluation/)

The evaluation system includes a diverse test dataset with multiple lead scenarios. The runner executes batch evaluations across models, and the metrics calculator tracks accuracy, response time, and consistency. A recommendations engine suggests prompt improvements based on results.

Automation (lib/automation/)

Auto-progression rules move leads through pipeline stages based on scores and activities. Rules are configurable and trigger on specific events like message generation or qualification completion.

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Grok API key from console.x.ai

### Local Development

1. Clone and install:
```bash
git clone <repository-url>
cd grok-sdr-demo
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the project root:
```bash
GROK_API_KEY=your_grok_api_key_here
DATABASE_URL="file:./prisma/dev.db"
```

3. Initialize the database:
```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

5. Open the application:
Navigate to http://localhost:3000

### Docker Deployment

Docker simplifies setup by eliminating Node.js version conflicts and dependency issues. One command gets everything running.

1. Set up environment:
Create a `.env` file:
```bash
GROK_API_KEY=your_grok_api_key_here
DATABASE_URL="file:./prisma/dev.db"
```

2. Start with Docker Compose:
```bash
docker-compose up
```

The application will be available at http://localhost:3000

The Docker setup uses a multi-stage build for optimized image size, includes health checks for reliability, mounts volumes for database persistence, and uses production-ready configuration.

### Production Build

```bash
npm run build
npm start
```

## How to Use

### Adding a Lead

Click "New Lead" on the Leads page, fill in name, email, company, and optional notes, then click "Create Lead."

### Qualifying a Lead

Open a lead's detail page and click "Qualify Lead." Optionally check "Use Custom Scoring Criteria" and adjust weights on a 1-5 scale. Higher weight means that factor matters more in scoring. Select a Grok model (default is grok-3) and click "Qualify with Grok." The results show the score, reasoning, and a breakdown of each factor.

Use custom criteria when you know what matters most. For example, if targeting enterprise deals, increase "Company Size" and "Decision Maker" weights.

### Generating a Message

On a lead's detail page, click "Generate Message." Grok creates a personalized subject line and email body. Review the message in the modal, copy it to your email client, and send. The message is automatically logged in the activity timeline.

### Managing Your Pipeline

Go to the Pipeline page to see all leads organized by stage. Click a lead card to view details. Use the dropdown on the lead detail page to change stages. The Closed stage is collapsed by default—click the arrow to expand.

### Comparing Models

Go to the Evaluation page and click "Test All Models." Wait about 15 seconds for results. The dashboard shows which model performs best for your leads, with recommendations on which to use for qualification.

## API Documentation

### Lead Management

GET /api/leads
- Get all leads with optional filtering
- Query params: stage, minScore, maxScore, limit
- Returns: { success: true, data: Lead[], count: number }

POST /api/leads
- Create a new lead
- Body: { name: string, email: string, company: string, notes?: string, metadata?: string }
- Returns: { success: true, data: Lead }

GET /api/leads/[id]
- Get lead by ID with full activity history
- Returns: { success: true, data: Lead }

PUT /api/leads/[id]
- Update lead information
- Body: { name?, email?, company?, notes?, stage?, score? }

DELETE /api/leads/[id]
- Delete a lead and all associated activities

### Lead Qualification

POST /api/leads/[id]/qualify
- Qualify a lead using Grok AI
- Body: { model?: 'grok-3' | 'grok-4-fast-reasoning' | 'grok-4-fast-non-reasoning', scoringCriteria?: { companySizeWeight, industryMatchWeight, budgetSignalsWeight, decisionMakerWeight } }
- Returns: { success: true, data: { lead, qualification: { score, reasoning, qualificationStatus, breakdown }, responseTime } }

### Messaging

POST /api/leads/[id]/message
- Generate personalized outreach message
- Body: { model?: string, context?: { previousInteractions?, companyInfo?, painPoints?, goals? } }
- Returns: { success: true, data: { outreach: { subjectLine, emailBody, followUpSuggestions, tone }, responseTime } }

### Pipeline Management

GET /api/pipeline
- Get all pipeline stages
- Returns: { success: true, data: PipelineStage[] }

PUT /api/leads/[id]/stage
- Update lead stage
- Body: { stage: string }
- Automatically logs stage change activity

### Search

GET /api/search
- Search leads across multiple fields
- Query params: q (required), stage, minScore, maxScore
- Returns: { success: true, data: Lead[], count: number, query: string }
- Searches: name, email, company, notes, activity descriptions

### Scoring Criteria

GET /api/scoring-criteria
- Get current scoring criteria (default or custom)

POST /api/scoring-criteria
- Create new scoring criteria
- Body: { companySizeWeight: number, industryMatchWeight: number, budgetSignalsWeight: number, decisionMakerWeight: number }

PUT /api/scoring-criteria
- Update scoring criteria

POST /api/leads/rescore
- Re-score all leads with updated criteria
- Body: { criteriaId?: string }

### Evaluation

GET /api/evaluation
- Get evaluation metrics and results
- Returns: { success: true, data: { models: ModelMetrics[], overallAverageResponseTime, overallAccuracy, recommendations, lastRunAt } }

POST /api/evaluation
- Run model evaluation
- Body: { model?: string, saveToDatabase?: boolean }
- Returns: Evaluation results and metrics

## Database Schema

### Lead
- id: Unique identifier
- name, email, company: Basic information
- score: Qualification score (0-100, nullable)
- stage: Current pipeline stage
- notes: Free-form notes
- metadata: JSON string for additional data
- createdAt, updatedAt: Timestamps

### PipelineStage
- id, name: Stage identifier
- order: Display order
- description: Stage description

### Activity
- id, leadId: References
- type: Activity type (qualification, message, stage_change, score_update, note)
- description: Human-readable description
- timestamp: When it happened
- grokResponse: Full Grok response (JSON)
- modelUsed: Which Grok model was used
- input, output: Input/output data (JSON)
- userTriggered: Who triggered it

### EvaluationResult
- id, modelVariant: Model identifier
- leadId: Reference to test lead
- responseTime: Response time in milliseconds
- score: Qualification score
- scoreConsistency: Consistency metric
- responseQuality: Quality metrics (JSON)
- createdAt: When evaluated

### ScoringCriteria
- id: Unique identifier
- userId: For multi-user support (optional)
- companySizeWeight, industryMatchWeight, budgetSignalsWeight, decisionMakerWeight: Weights (Float, default 1.0)
- isDefault: Whether this is the default criteria
- createdAt, updatedAt: Timestamps

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Test coverage includes prompt engineering functions, evaluation runner and metrics, API endpoint validation, and error handling.

## Troubleshooting

### Database Issues

Migration errors:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

Database not found:
Ensure DATABASE_URL is set correctly in `.env.local`:
```
DATABASE_URL="file:./prisma/dev.db"
```

### API Key Issues

Grok API errors:
- Verify your API key is correct in `.env.local` or `.env`
- Check API key permissions at console.x.ai
- Ensure you have sufficient API credits
- The application includes comprehensive error handling for API failures

Rate limiting:
- Error messages will clearly indicate rate limit issues
- Consider implementing retry logic for production use

### Build Issues

Prisma client not generated:
```bash
npx prisma generate
```

Type errors:
```bash
npm run build
```

Docker build failures:
- Ensure Docker has sufficient memory (4GB+ recommended)
- Check that all dependencies are listed in package.json
- Verify Node.js version compatibility (Node 18+)

### Port Conflicts

If port 3000 is already in use:
```bash
PORT=3001 npm run dev
```

Or update docker-compose.yml to use a different port.

### Common Issues

Lead not found error:
- Check that the lead ID is correct
- Verify the database is properly initialized
- Run `npm run db:seed` to populate sample data

Search not working:
- Ensure you're typing in the search box (it's real-time, no button needed)
- Check browser console for errors
- Verify the API is running

Evaluation taking too long:
- The demo uses 2 leads for speed (about 15 seconds)
- Full evaluation with 10 leads takes longer
- Check Grok API response times

## Development Notes

### Environment Variables
- GROK_API_KEY: Required - Your Grok API key from console.x.ai
- DATABASE_URL: Database connection string (default: file:./prisma/dev.db)
- NODE_ENV: Set to production for production builds

### Code Organization
- API routes follow RESTful conventions with consistent error handling
- Prompts are modularized for easy iteration and A/B testing
- Evaluation framework is extensible for new models and metrics
- Type safety is enforced with TypeScript throughout
- Error handling provides comprehensive validation and user-friendly messages

### Performance Considerations
- Database queries are indexed for common lookups (stage, score)
- API responses include only necessary data
- Evaluation runs are optimized for demo speed (2 leads)
- Real-time search is debounced (300ms) for performance

### Design Decisions

Why SQLite:
SQLite works well for demos and small teams. It requires no database server setup, is easy to backup (just copy the file), and can be migrated to PostgreSQL or MySQL later if needed.

Why Next.js App Router:
The App Router provides modern React patterns, built-in API routes eliminating the need for a separate backend, server-side rendering for better performance, and TypeScript support out of the box.

Why Tailwind CSS:
Tailwind enables rapid UI development with a consistent design system, easy customization, and minimal CSS file size.

Why Zod validation:
Zod provides type-safe schema validation, catches errors before they reach the Grok API, produces better error messages for users, and works seamlessly with TypeScript.

## Demo Presentation Guide

For a 10-15 minute client demo:

1. Start with the problem (2 minutes)
   - Sales reps waste time on unqualified leads
   - Generic emails get ignored
   - Hard to track what's working

2. Show the solution (8-10 minutes)
   - Leads page: Show search, filtering, score trends, next actions
   - Qualify a lead: Use custom criteria, show score breakdown
   - Generate a message: Show personalized output
   - Pipeline: Show visual organization
   - Evaluation: Run model comparison, show recommendations

3. Highlight key differentiators (2-3 minutes)
   - Customizable scoring (not one-size-fits-all)
   - Model comparison (data-driven decisions)
   - Activity tracking (complete visibility)
   - Fast evaluation (under 15 seconds)

Have a few leads pre-qualified so you can show the system working immediately.

## License

This project is a demonstration prototype built for evaluation purposes.
