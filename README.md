# Grok SDR Demo

A full-stack Sales Development Representative system powered by Grok AI. This application demonstrates intelligent lead qualification, personalized outreach generation, and automated pipeline management using Grok's API.

## Overview

The Grok SDR Demo is a production-ready prototype that showcases how Grok AI can enhance sales prospecting workflows. The system evaluates multiple Grok model variants, provides comprehensive lead scoring, and generates personalized outreach messages based on lead data.

## Features

### Grok API Integration
- Core intelligence layer using Grok API
- Optimized prompt engineering for sales use cases
- Response validation and error handling
- Support for multiple model variants (grok-3, grok-4-fast-reasoning, grok-4-fast-non-reasoning)

### Model Evaluation Framework
- Systematic evaluation across different Grok models
- Comprehensive evaluation dataset with diverse lead scenarios
- Metrics tracking: accuracy, relevance, response time, consistency
- Failure analysis and prompt iteration recommendations
- Performance comparison dashboard

### Lead Qualification & Management
- AI-powered lead scoring and assessment
- Customizable scoring criteria with dynamic re-scoring
- Defined pipeline stages with automated progression rules
- Activity history and interaction logging
- Full CRUD operations with data validation

### Personalized Messaging
- Context-aware outreach message generation
- Subject line and email body creation
- Follow-up suggestions based on lead data
- Activity tracking for all generated messages

### Data Management
- SQLite database with Prisma ORM
- Comprehensive search across leads, companies, and metadata
- Indexed queries for performance
- Data validation and type safety

### User Interface
- Intuitive navigation and responsive design
- Lead list view with filtering and search
- Detailed lead view with activity timeline
- Pipeline kanban board visualization
- Model evaluation dashboard

## Technical Architecture

### Stack
- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- Backend: Next.js API Routes, Prisma ORM
- Database: SQLite
- AI: Grok API (xAI)
- Testing: Vitest
- Deployment: Docker

### Project Structure
```
grok-sdr-demo/
├── app/                    # Next.js app directory
│   ├── api/               # API route handlers
│   ├── leads/             # Lead management pages
│   ├── pipeline/          # Pipeline visualization
│   └── evaluation/       # Model evaluation dashboard
├── components/            # React components
├── lib/                   # Core libraries
│   ├── grok.ts           # Grok API client
│   ├── prompts/          # Prompt engineering
│   ├── evaluation/       # Evaluation framework
│   └── automation/       # Auto-progression rules
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

### Key Components

**Grok API Client** (`lib/grok.ts`)
- Centralized API client with error handling
- Model selection support
- Response validation with Zod

**Prompt Engineering** (`lib/prompts/`)
- Qualification prompts with dynamic scoring criteria
- Messaging prompts with context awareness
- Structured response parsing

**Evaluation Framework** (`lib/evaluation/`)
- Dataset management with diverse test cases
- Runner for batch evaluations
- Metrics calculation and analysis
- Recommendations generation

**Automation** (`lib/automation/`)
- Auto-progression rules based on scores
- Activity-based triggers
- Pipeline stage management

## Setup Instructions

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Grok API key from console.x.ai

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd grok-sdr-demo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the project root:
```bash
GROK_API_KEY=your_grok_api_key_here
DATABASE_URL="file:./prisma/dev.db"
```

4. Initialize the database:
```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open the application:
Navigate to http://localhost:3000

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t grok-sdr-demo .
```

2. Run with Docker Compose:
```bash
docker-compose up
```

Ensure your `.env` file or environment variables include:
- `GROK_API_KEY`: Your Grok API key

The application will be available at http://localhost:3000

### Production Build

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## API Documentation

### Lead Management

**GET /api/leads**
- Retrieve all leads
- Query parameters: `stage` (filter by stage)

**POST /api/leads**
- Create a new lead
- Body: `{ name, email, company, notes?, metadata? }`

**GET /api/leads/[id]**
- Get lead by ID

**PUT /api/leads/[id]**
- Update lead
- Body: `{ name?, email?, company?, notes?, metadata? }`

**DELETE /api/leads/[id]**
- Delete lead

### Lead Qualification

**POST /api/leads/[id]/qualify**
- Qualify a lead using Grok AI
- Body: `{ model?: string }`
- Returns: `{ score, reasoning, qualificationStatus }`

### Messaging

**POST /api/leads/[id]/message**
- Generate personalized outreach message
- Body: `{ model?: string }`
- Returns: `{ outreach: { subjectLine, emailBody, followUpSuggestions } }`

### Pipeline Management

**GET /api/pipeline**
- Get all pipeline stages

**PUT /api/leads/[id]/stage**
- Update lead stage
- Body: `{ stage: string }`

### Search

**GET /api/search**
- Search leads across multiple fields
- Query parameters:
  - `q`: Search query
  - `stage`: Filter by stage
  - `minScore`, `maxScore`: Score range
  - `startDate`, `endDate`: Date range

### Scoring Criteria

**GET /api/scoring-criteria**
- Get scoring criteria

**POST /api/scoring-criteria**
- Create new scoring criteria
- Body: `{ companySizeWeight, industryMatchWeight, budgetSignalsWeight, decisionMakerWeight }`

**PUT /api/scoring-criteria**
- Update scoring criteria
- Body: Same as POST

**POST /api/leads/rescore**
- Re-score all leads with updated criteria
- Body: `{ criteriaId?: string }`

### Evaluation

**GET /api/evaluation**
- Get evaluation metrics and results

**POST /api/evaluation**
- Run model evaluation
- Body: `{ saveToDatabase?: boolean }`
- Returns: Evaluation results and metrics

### Activities

**GET /api/leads/[id]/activities**
- Get activity history for a lead

**POST /api/leads/[id]/activities**
- Log new activity
- Body: `{ type, description, input?, output? }`

## Database Schema

### Lead
- Basic information: name, email, company
- Scoring: score (0-100)
- Pipeline: stage
- Metadata: notes, metadata (JSON)
- Timestamps: createdAt, updatedAt

### PipelineStage
- Stage definition with order and description

### Activity
- Activity logging with type, description, timestamp
- Grok response storage (JSON)
- Model tracking and input/output logging

### EvaluationResult
- Model variant tracking
- Performance metrics: response time, score, consistency
- Quality metrics storage

### ScoringCriteria
- Customizable weights for different scoring factors
- User-specific or default criteria

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Test coverage includes:
- Prompt engineering functions
- Evaluation runner and metrics
- API endpoint validation

## Troubleshooting

### Database Issues

**Migration errors:**
```bash
npx prisma migrate reset
npx prisma migrate dev
```

**Database not found:**
Ensure `DATABASE_URL` is set correctly in `.env.local`:
```
DATABASE_URL="file:./prisma/dev.db"
```

### API Key Issues

**Grok API errors:**
- Verify your API key is correct in `.env.local`
- Check API key permissions in console.x.ai
- Ensure you have sufficient credits

**Rate limiting:**
- The application includes error handling for rate limits
- Consider implementing retry logic for production use

### Build Issues

**Prisma client not generated:**
```bash
npx prisma generate
```

**Type errors:**
```bash
npm run build
```

**Docker build failures:**
- Ensure Docker has sufficient memory (4GB+)
- Check that all dependencies are listed in package.json
- Verify Node.js version compatibility

### Port Conflicts

If port 3000 is already in use:
```bash
PORT=3001 npm run dev
```

Or update docker-compose.yml to use a different port.

## Development Notes

### Environment Variables
- `GROK_API_KEY`: Required for Grok API access
- `DATABASE_URL`: Database connection string
- `NODE_ENV`: Set to `production` for production builds

### Code Organization
- API routes follow RESTful conventions
- Prompts are modularized for easy iteration
- Evaluation framework is extensible for new models
- Type safety enforced with TypeScript throughout

### Performance Considerations
- Database queries are indexed for common lookups
- API responses are cached where appropriate
- Evaluation runs can be resource-intensive
- Consider async processing for large batches

## License

This project is a demonstration prototype built for evaluation purposes.
