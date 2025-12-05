# Grok SDR Demo

A full-stack Sales Development Representative system powered by Grok AI. This application demonstrates intelligent lead qualification, personalized outreach generation, and automated pipeline management using Grok's API.

## Overview

The Grok SDR Demo is a production-ready prototype that showcases how Grok AI can enhance sales prospecting workflows. The system evaluates leads, generates personalized outreach messages, and manages leads through a configurable sales pipeline with comprehensive activity tracking.

## Features

### Grok API Integration

- Core intelligence layer using Grok API for lead qualification and messaging
- Support for multiple Grok model variants (grok-3, grok-4-fast-reasoning, grok-4-fast-non-reasoning)
- Optimized prompt engineering for sales use cases
- Comprehensive response validation using Zod schemas
- Robust error handling and retry logic

### Model Evaluation Framework

- Systematic evaluation framework comparing Grok model variants
- Evaluation dataset with diverse lead scenarios
- Metrics tracking: accuracy, relevance, response time, score consistency
- Qualitative analysis of model failures
- Automated recommendations for prompt improvements
- Performance comparison dashboard

### Lead Qualification & Management

- AI-powered lead scoring using Grok
- Customizable scoring criteria with weighted factors
- Dynamic re-scoring when criteria change
- Pipeline stage management with automated progression rules
- Comprehensive activity logging with Grok response tracking
- Search functionality across lead data and metadata

### Personalized Messaging

- Context-aware outreach message generation
- Customized subject lines and email bodies
- Follow-up suggestions based on lead profile
- Integration with lead activity history

### User Interface

- Clean, intuitive frontend built with Next.js and Tailwind CSS
- Lead list view with filtering and search
- Detailed lead view with activity timeline
- Pipeline kanban board visualization
- Model evaluation dashboard
- Responsive design for desktop and mobile

### Data Management

- SQLite database with Prisma ORM
- Full CRUD operations with validation
- Search across conversations and company metadata
- Activity history with full audit trail

## Technical Architecture

### Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: SQLite with Prisma ORM
- AI: Grok API (xAI)
- Validation: Zod
- Testing: Vitest

### Project Structure

```
grok-sdr-demo/
├── app/                    # Next.js app directory
│   ├── api/               # API route handlers
│   ├── leads/             # Lead management pages
│   ├── pipeline/          # Pipeline visualization
│   └── evaluation/        # Model evaluation dashboard
├── components/            # React components
├── lib/                   # Core libraries
│   ├── grok.ts           # Grok API client
│   ├── prompts/          # Prompt engineering
│   ├── evaluation/       # Model evaluation framework
│   └── automation/       # Auto-progression rules
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

### Database Schema

- Lead: Core lead information with scoring and stage tracking
- PipelineStage: Configurable pipeline stages
- Activity: Comprehensive activity logging with Grok responses
- EvaluationResult: Model performance metrics
- ScoringCriteria: User-defined scoring weights

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Grok API key from console.x.ai

### Local Development Setup

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

6. Open http://localhost:3000 in your browser

### Docker Deployment

#### Using Docker Compose

1. Set up environment variables:
Create a `.env` file in the project root:
```bash
GROK_API_KEY=your_grok_api_key_here
```

2. Build and start containers:
```bash
docker-compose up --build
```

The application will be available at http://localhost:3000

#### Using Dockerfile Directly

1. Build the image:
```bash
docker build -t grok-sdr-demo .
```

2. Run the container:
```bash
docker run -p 3000:3000 \
  -e GROK_API_KEY=your_grok_api_key_here \
  -e DATABASE_URL="file:./prisma/dev.db" \
  -v $(pwd)/prisma/dev.db:/app/prisma/dev.db \
  grok-sdr-demo
```

### Production Deployment

For production deployments, ensure:

1. Set `NODE_ENV=production`
2. Use a production database (PostgreSQL recommended)
3. Configure proper environment variables
4. Set up reverse proxy (nginx recommended)
5. Enable HTTPS
6. Configure monitoring and logging

## API Documentation

### Lead Management

- `GET /api/leads` - List all leads with optional stage filter
- `POST /api/leads` - Create a new lead
- `GET /api/leads/[id]` - Get lead details
- `PUT /api/leads/[id]` - Update lead information
- `DELETE /api/leads/[id]` - Delete a lead

### Lead Qualification

- `POST /api/leads/[id]/qualify` - Qualify a lead using Grok AI
  - Body: `{ "model": "grok-3" }`
  - Returns: Updated lead with score and qualification status

### Messaging

- `POST /api/leads/[id]/message` - Generate personalized outreach message
  - Body: `{ "model": "grok-3" }`
  - Returns: Subject line, email body, and follow-up suggestions

### Pipeline Management

- `GET /api/pipeline` - Get all pipeline stages
- `PUT /api/leads/[id]/stage` - Update lead stage
  - Body: `{ "stage": "Qualified" }`

### Activity Logging

- `GET /api/leads/[id]/activities` - Get activity history for a lead
- `POST /api/leads/[id]/activities` - Log a new activity

### Search

- `GET /api/search?q=query&stage=New` - Search leads across multiple fields
  - Query parameters: `q` (search query), `stage` (filter by stage), `minScore`, `maxScore`

### Scoring Criteria

- `GET /api/scoring-criteria` - Get current scoring criteria
- `POST /api/scoring-criteria` - Create new scoring criteria
- `PUT /api/scoring-criteria` - Update scoring criteria

### Re-scoring

- `POST /api/leads/rescore` - Re-score all leads with updated criteria

### Model Evaluation

- `GET /api/evaluation` - Get evaluation metrics and results
- `POST /api/evaluation` - Run model evaluation
  - Body: `{ "saveToDatabase": true }`
  - Returns: Evaluation results comparing model variants

## Usage Guide

### Qualifying Leads

1. Navigate to the Leads page
2. Click on a lead to view details
3. Click "Qualify Lead" button
4. Review the AI-generated score and reasoning
5. Lead score and stage are automatically updated

### Generating Outreach Messages

1. Open a lead detail page
2. Click "Generate Message" button
3. Review the personalized subject line and email body
4. Copy the message for use in your email client

### Managing Pipeline Stages

1. View the Pipeline page for kanban board visualization
2. Update lead stages from the lead detail page
3. Stages automatically progress based on score thresholds

### Running Model Evaluations

1. Navigate to the Evaluation page
2. Click "Run Evaluation" to compare model variants
3. Review metrics: response time, accuracy, consistency
4. Check recommendations for prompt improvements

### Customizing Scoring Criteria

1. Use the scoring criteria API endpoints
2. Adjust weights for company size, industry match, budget signals, decision maker
3. Re-score all leads with updated criteria

## Troubleshooting

### Database Issues

If you encounter database errors:

1. Reset the database:
```bash
rm prisma/dev.db
npx prisma migrate dev
npm run db:seed
```

2. Regenerate Prisma client:
```bash
npx prisma generate
```

### API Key Issues

If Grok API calls fail:

1. Verify your API key is set correctly in `.env.local`
2. Check API key validity at console.x.ai
3. Ensure you have sufficient credits
4. Review error messages in browser console or server logs

### Build Errors

If Docker build fails:

1. Clear Docker cache:
```bash
docker system prune -a
```

2. Rebuild without cache:
```bash
docker-compose build --no-cache
```

### Port Already in Use

If port 3000 is already in use:

1. Change port in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"
```

2. Or stop the existing process:
```bash
lsof -ti:3000 | xargs kill
```

### Prisma Client Errors

If you see Prisma client errors:

1. Regenerate the client:
```bash
npx prisma generate
```

2. Restart the development server

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
- Grok API integration
- Prompt engineering functions
- Evaluation framework
- Metrics calculations

## Development

### Adding New Features

1. Create feature branch
2. Implement changes following existing patterns
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

### Code Style

- TypeScript strict mode enabled
- ESLint configuration follows Next.js best practices
- Prefer functional components with hooks
- Use Zod for all input validation

## License

This project is a demonstration prototype built for evaluation purposes.

## Support

For issues or questions:
- Review the troubleshooting section
- Check API documentation
- Examine server logs for detailed error messages
