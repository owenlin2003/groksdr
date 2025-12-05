# Grok SDR Demo

> **Built in 4 hours to demonstrate Grok's power for sales teams** 🚀

A production-ready Sales Development Representative system powered by Grok AI. This application showcases intelligent lead qualification, personalized outreach generation, and automated pipeline management—all designed to make your sales team more effective, not more technical.

## 🎯 What This Does

Imagine you're a sales rep juggling dozens of leads. You need to know: *Which ones are worth your time? What should I say to them? Where are they in my pipeline?* 

Grok SDR answers all of that. It's like having an AI assistant that never sleeps, evaluates every lead with the same criteria you would (if you had time), and writes personalized messages that actually sound human.

**Built for sales reps, not engineers.** Every screen is designed so you can focus on selling, not figuring out how to use software.

## ✨ Key Features

### 🤖 Grok API Integration
- **Core intelligence layer** using Grok's API for all AI-powered features
- **Optimized prompt engineering** specifically tuned for sales use cases
- **Multiple model support**: Compare grok-3, grok-4-fast-reasoning, and grok-4-fast-non-reasoning
- **Comprehensive error handling** so you never lose work when something goes wrong
- **Response validation** ensures Grok's answers are always in the right format

### 📊 Model Evaluation Framework
- **Systematic comparison** of Grok model variants to find what works best for your leads
- **Evaluation dataset** with diverse lead scenarios (enterprise, startup, mid-market, edge cases)
- **Real-time metrics**: Accuracy, response speed, reliability (consistency), and lead quality scores
- **Performance dashboard** that shows you which model to use—no guessing
- **Fast evaluation**: Complete in under 15 seconds for quick demos
- **Recommendations** based on actual performance data, not opinions

**Why this matters:** Not all AI models are created equal. This framework helps you pick the right Grok model for your specific sales process.

### 🎯 Lead Qualification & Management

**AI-Powered Scoring**
- Grok evaluates each lead and gives you a score from 0-100
- Scores are based on: Company Size, Industry Match, Budget Signals, and Decision Maker Title
- **Customizable weights**: Want to prioritize budget over company size? Adjust the sliders (1-5 scale) and re-score instantly
- **Score breakdown** shows exactly why a lead scored what it did
- **Re-scoring**: Change your criteria? Re-score all leads with one click

**Pipeline Management**
- **Visual Kanban board** showing all your leads across stages
- **Automated progression**: Leads automatically move through stages based on scores and activities
- **Collapsible stages**: Keep "Closed" collapsed so you focus on active deals
- **Activity timeline**: See everything that's happened with a lead—qualifications, messages, stage changes

**Smart Features for Sales Reps**
- **Last activity timestamp**: See when you last touched a lead ("Qualified 2 hours ago")
- **Score trends**: Know if a lead is heating up (↑ +15) or cooling down (↓ -8)
- **Next action hints**: Get suggestions like "Schedule demo call" or "⚠️ No activity in 7 days - follow up"
- **CSV export**: Export all your leads with one click for use in other tools

### 💬 Personalized Messaging

**Context-Aware Outreach**
- Grok generates personalized subject lines and email bodies based on:
  - Lead's company size and industry
  - Their role and decision-making authority
  - Previous interactions (if any)
  - Your notes and metadata
- **Follow-up suggestions**: Get actionable next steps for each message
- **Tone matching**: Professional for enterprise, casual for startups
- **Activity logging**: Every message is tracked so you know what you've sent

**Why this works:** Generic emails get deleted. Personalized ones get responses. Grok reads between the lines of your lead data to write messages that actually resonate.

### 🔍 Data Management

**Comprehensive Search**
- **Real-time search** as you type (no need to click a button)
- Search across: Names, emails, companies, notes, and activity history
- **Stage filtering**: See only leads in "Qualified" or "Meeting Scheduled"
- **Smart sorting**: By score, name, company, or date

**Database & Storage**
- SQLite database with Prisma ORM for reliable data storage
- **Full CRUD operations**: Create, read, update, delete leads with validation
- **Activity history**: Complete audit trail of every action
- **Indexed queries** for fast performance even with hundreds of leads

### 🎨 User Interface

**Designed for Sales Teams**
- **Minimalist design**: No clutter, just what you need
- **Intuitive navigation**: Leads, Pipeline, Evaluation—three main sections, easy to understand
- **Responsive**: Works on desktop, tablet, or laptop
- **Fast loading**: Optimized for quick interactions
- **Error handling**: Clear messages when something goes wrong, not technical jargon

**Key Pages:**
- **Leads Page**: List view with search, filtering, sorting, and CSV export
- **Lead Detail**: Full lead information, qualification, messaging, stage changes, and activity timeline
- **Pipeline**: Visual Kanban board showing leads across stages
- **Evaluation**: Model comparison dashboard with performance metrics

## 🏗️ Technical Architecture

### Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with Prisma ORM
- **Database**: SQLite (perfect for demos and small teams)
- **AI**: Grok API (xAI) with support for multiple model variants
- **Testing**: Vitest for unit tests
- **Deployment**: Docker & Docker Compose for easy setup

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
│   │   ├── runner.ts     # Evaluation execution
│   │   └── metrics.ts    # Metrics calculation
│   └── automation/       # Auto-progression rules
├── prisma/               # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts
└── public/               # Static assets
```

### Key Components

**Grok API Client** (`lib/grok.ts`)
- Centralized client with error handling and retry logic
- Model selection support (grok-3, grok-4-fast-reasoning, grok-4-fast-non-reasoning)
- Response validation with Zod schemas
- Handles API errors gracefully

**Prompt Engineering** (`lib/prompts/`)
- **Qualification prompts**: Dynamic prompts that adapt to custom scoring criteria
- **Messaging prompts**: Context-aware prompts that use lead history
- Structured response parsing with validation
- Optimized for sales use cases

**Evaluation Framework** (`lib/evaluation/`)
- Diverse test dataset with 10+ lead scenarios
- Batch evaluation runner for comparing models
- Metrics calculation: accuracy, response time, consistency
- Recommendations engine for prompt iteration

**Automation** (`lib/automation/`)
- Auto-progression rules based on scores and activities
- Activity-based triggers (message sent → auto-progress to "Contacted")
- Configurable thresholds

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Grok API key from [console.x.ai](https://console.x.ai)

### Local Development

1. **Clone and install:**
```bash
git clone <repository-url>
cd grok-sdr-demo
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file in the project root:
```bash
GROK_API_KEY=your_grok_api_key_here
DATABASE_URL="file:./prisma/dev.db"
```

3. **Initialize the database:**
```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open the application:**
Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Deployment (Recommended)

**Why Docker?** One command to get everything running. No Node.js version conflicts, no dependency issues, no "works on my machine" problems.

1. **Set up environment:**
Create a `.env` file:
```bash
GROK_API_KEY=your_grok_api_key_here
DATABASE_URL="file:./prisma/dev.db"
```

2. **Start with Docker Compose:**
```bash
docker-compose up
```

That's it! The application will be available at [http://localhost:3000](http://localhost:3000)

The Docker setup includes:
- Multi-stage build for optimized image size
- Health checks for reliability
- Volume mounting for database persistence
- Production-ready configuration

### Production Build

```bash
npm run build
npm start
```

## 📖 How to Use (For Sales Reps)

### Adding a Lead
1. Click **"New Lead"** on the Leads page
2. Fill in: Name, Email, Company, Notes (optional)
3. Click **"Create Lead"**

### Qualifying a Lead
1. Click on any lead to open the detail page
2. Click **"Qualify Lead"**
3. **Optional**: Check "Use Custom Scoring Criteria" and adjust weights (1-5 scale)
   - Higher weight = more important in scoring
   - Example: Set "Budget Signals" to 5/5 if budget is critical
4. Select a Grok model (default: grok-3)
5. Click **"Qualify with Grok"**
6. See the score, reasoning, and breakdown

**Pro tip:** Use custom criteria when you know what matters most. For example, if you're targeting enterprise deals, boost "Company Size" and "Decision Maker" weights.

### Generating a Message
1. On a lead's detail page, click **"Generate Message"**
2. Grok creates a personalized subject line and email body
3. Review the message in the modal
4. Copy and use it in your email client
5. The message is automatically logged in the activity timeline

### Managing Your Pipeline
1. Go to the **Pipeline** page
2. See all leads organized by stage
3. Click a lead card to view details
4. Use the dropdown on the lead detail page to change stages
5. **Closed** stage is collapsed by default—click the arrow to expand

### Comparing Models
1. Go to the **Evaluation** page
2. Click **"Test All Models"**
3. Wait ~15 seconds for results
4. See which model performs best for your leads
5. Use the recommended model for qualification

## 🔧 API Documentation

### Lead Management

**GET /api/leads**
- Get all leads with optional filtering
- Query params: `stage`, `minScore`, `maxScore`, `limit`
- Returns: `{ success: true, data: Lead[], count: number }`

**POST /api/leads**
- Create a new lead
- Body: `{ name: string, email: string, company: string, notes?: string, metadata?: string }`
- Returns: `{ success: true, data: Lead }`

**GET /api/leads/[id]**
- Get lead by ID with full activity history
- Returns: `{ success: true, data: Lead }`

**PUT /api/leads/[id]**
- Update lead information
- Body: `{ name?, email?, company?, notes?, stage?, score? }`

**DELETE /api/leads/[id]**
- Delete a lead and all associated activities

### Lead Qualification

**POST /api/leads/[id]/qualify**
- Qualify a lead using Grok AI
- Body: `{ model?: 'grok-3' | 'grok-4-fast-reasoning' | 'grok-4-fast-non-reasoning', scoringCriteria?: { companySizeWeight, industryMatchWeight, budgetSignalsWeight, decisionMakerWeight } }`
- Returns: `{ success: true, data: { lead, qualification: { score, reasoning, qualificationStatus, breakdown }, responseTime } }`

### Messaging

**POST /api/leads/[id]/message**
- Generate personalized outreach message
- Body: `{ model?: string, context?: { previousInteractions?, companyInfo?, painPoints?, goals? } }`
- Returns: `{ success: true, data: { outreach: { subjectLine, emailBody, followUpSuggestions, tone }, responseTime } }`

### Pipeline Management

**GET /api/pipeline**
- Get all pipeline stages
- Returns: `{ success: true, data: PipelineStage[] }`

**PUT /api/leads/[id]/stage**
- Update lead stage
- Body: `{ stage: string }`
- Automatically logs stage change activity

### Search

**GET /api/search**
- Search leads across multiple fields
- Query params:
  - `q`: Search query (required)
  - `stage`: Filter by stage
  - `minScore`, `maxScore`: Score range
- Returns: `{ success: true, data: Lead[], count: number, query: string }`
- Searches: name, email, company, notes, activity descriptions

### Scoring Criteria

**GET /api/scoring-criteria**
- Get current scoring criteria (default or custom)

**POST /api/scoring-criteria**
- Create new scoring criteria
- Body: `{ companySizeWeight: number, industryMatchWeight: number, budgetSignalsWeight: number, decisionMakerWeight: number }`

**PUT /api/scoring-criteria**
- Update scoring criteria

**POST /api/leads/rescore**
- Re-score all leads with updated criteria
- Body: `{ criteriaId?: string }`

### Evaluation

**GET /api/evaluation**
- Get evaluation metrics and results
- Returns: `{ success: true, data: { models: ModelMetrics[], overallAverageResponseTime, overallAccuracy, recommendations, lastRunAt } }`

**POST /api/evaluation**
- Run model evaluation
- Body: `{ model?: string, saveToDatabase?: boolean }`
- Returns: Evaluation results and metrics

## 🗄️ Database Schema

### Lead
- `id`: Unique identifier
- `name`, `email`, `company`: Basic information
- `score`: Qualification score (0-100, nullable)
- `stage`: Current pipeline stage
- `notes`: Free-form notes
- `metadata`: JSON string for additional data
- `createdAt`, `updatedAt`: Timestamps

### PipelineStage
- `id`, `name`: Stage identifier
- `order`: Display order
- `description`: Stage description

### Activity
- `id`, `leadId`: References
- `type`: Activity type (qualification, message, stage_change, score_update, note)
- `description`: Human-readable description
- `timestamp`: When it happened
- `grokResponse`: Full Grok response (JSON)
- `modelUsed`: Which Grok model was used
- `input`, `output`: Input/output data (JSON)
- `userTriggered`: Who triggered it

### EvaluationResult
- `id`, `modelVariant`: Model identifier
- `leadId`: Reference to test lead
- `responseTime`: Response time in milliseconds
- `score`: Qualification score
- `scoreConsistency`: Consistency metric
- `responseQuality`: Quality metrics (JSON)
- `createdAt`: When evaluated

### ScoringCriteria
- `id`: Unique identifier
- `userId`: For multi-user support (optional)
- `companySizeWeight`, `industryMatchWeight`, `budgetSignalsWeight`, `decisionMakerWeight`: Weights (Float, default 1.0)
- `isDefault`: Whether this is the default criteria
- `createdAt`, `updatedAt`: Timestamps

## 🧪 Testing

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
- Error handling

## 🐛 Troubleshooting

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
- Verify your API key is correct in `.env.local` or `.env`
- Check API key permissions at [console.x.ai](https://console.x.ai)
- Ensure you have sufficient API credits
- The application includes comprehensive error handling for API failures

**Rate limiting:**
- Error messages will clearly indicate rate limit issues
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
- Ensure Docker has sufficient memory (4GB+ recommended)
- Check that all dependencies are listed in package.json
- Verify Node.js version compatibility (Node 18+)

### Port Conflicts

If port 3000 is already in use:
```bash
PORT=3001 npm run dev
```

Or update `docker-compose.yml` to use a different port.

### Common Issues

**"Lead not found" error:**
- Check that the lead ID is correct
- Verify the database is properly initialized
- Run `npm run db:seed` to populate sample data

**Search not working:**
- Ensure you're typing in the search box (it's real-time, no button needed)
- Check browser console for errors
- Verify the API is running

**Evaluation taking too long:**
- The demo uses 2 leads for speed (~15 seconds)
- Full evaluation with 10 leads takes longer
- Check Grok API response times

## 📝 Development Notes

### Environment Variables
- `GROK_API_KEY`: **Required** - Your Grok API key from console.x.ai
- `DATABASE_URL`: Database connection string (default: `file:./prisma/dev.db`)
- `NODE_ENV`: Set to `production` for production builds

### Code Organization
- **API routes**: Follow RESTful conventions with consistent error handling
- **Prompts**: Modularized for easy iteration and A/B testing
- **Evaluation framework**: Extensible for new models and metrics
- **Type safety**: TypeScript enforced throughout for reliability
- **Error handling**: Comprehensive validation and user-friendly error messages

### Performance Considerations
- Database queries are indexed for common lookups (stage, score)
- API responses include only necessary data
- Evaluation runs are optimized for demo speed (2 leads)
- Real-time search is debounced (300ms) for performance

### Design Decisions

**Why SQLite?**
- Perfect for demos and small teams
- No database server setup required
- Easy to backup (just copy the file)
- Can migrate to PostgreSQL/MySQL later if needed

**Why Next.js App Router?**
- Modern React patterns
- Built-in API routes (no separate backend)
- Server-side rendering for better performance
- TypeScript support out of the box

**Why Tailwind CSS?**
- Rapid UI development
- Consistent design system
- Easy to customize
- Minimal CSS file size

**Why Zod validation?**
- Type-safe schema validation
- Catches errors before they reach Grok API
- Better error messages for users
- Works seamlessly with TypeScript

## 🎯 Demo Presentation Guide

**For a 10-15 minute client demo:**

1. **Start with the problem** (2 min)
   - "Sales reps waste time on unqualified leads"
   - "Generic emails get ignored"
   - "Hard to track what's working"

2. **Show the solution** (8-10 min)
   - **Leads page**: Show search, filtering, score trends, next actions
   - **Qualify a lead**: Use custom criteria, show score breakdown
   - **Generate a message**: Show personalized output
   - **Pipeline**: Show visual organization
   - **Evaluation**: Run model comparison, show recommendations

3. **Highlight key differentiators** (2-3 min)
   - Customizable scoring (not one-size-fits-all)
   - Model comparison (data-driven decisions)
   - Activity tracking (complete visibility)
   - Fast evaluation (under 15 seconds)

**Pro tip:** Have a few leads pre-qualified so you can show the system working immediately.

## 📄 License

This project is a demonstration prototype built for evaluation purposes.

---

**Built with ❤️ using Grok AI**

*Questions? Check the troubleshooting section or review the code—it's well-documented and easy to follow.*
