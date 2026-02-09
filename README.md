# AgentOps Platform

**Multi-Agent Evaluation, Telemetry & Optimization System for LLMs**

AgentOps is a production-ready platform that evaluates, monitors, and optimizes AI/LLM responses using a multi-agent architecture. It provides comprehensive evaluation across coherence, factuality, safety, helpfulness, and compliance dimensions.

## 🎯 What Is This For?

AgentOps is **NOT a chatbot**. It's an **AI observability and evaluation platform**.

**Use it to:**
-  **Evaluate AI responses** - Get quality scores (coherence, factuality, helpfulness)
-  **Monitor safety** - Detect toxic, biased, or harmful AI outputs
-  **Optimize prompts** - Get AI-suggested improvements to your prompts
-  **Track performance** - Monitor costs, latency, token usage
-  **Ensure compliance** - Check if AI follows your Standard Operating Procedures (SOPs)

**Think of it as:** Google Analytics + Sentry + Testing Suite for your AI applications.

## Quick Start - Test It Now

1. **Start the backend** (in one terminal):
   ```bash
   cd backend
   .\venv\Scripts\python.exe -m uvicorn app:app --reload --port 8000
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open the dashboard**: `http://localhost:3000`

4. **Go to "Test Evaluation"** in the sidebar and try evaluating a conversation:
   - Enter a user question
   - Enter an AI response
   - Click "Evaluate"
   - See quality scores, safety alerts, and optimization suggestions!

5. **View results** in the "Conversations" page

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌─────────┐  ┌──────────────┐  ┌────────────┐  ┌───────────┐  │
│  │Dashboard│  │Conversations │  │Optimization│  │ Telemetry │  │
│  └────┬────┘  └──────┬───────┘  └─────┬──────┘  └─────┬─────┘  │
│       └──────────────┴────────────────┴───────────────┘        │
│                              │                                   │
│                    Supabase Auth (JWT)                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│                       Backend (FastAPI)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  LangGraph Orchestrator                  │   │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐    │   │
│  │  │Coherence│ │Factuality│ │ Safety │ │Helpfulness │    │   │
│  │  └─────────┘ └──────────┘ └────────┘ └────────────┘    │   │
│  │  ┌─────────┐ ┌──────────┐ ┌────────────────────────┐   │   │
│  │  │   SOP   │ │Optimizer │ │   Prompt Improver     │   │   │
│  │  └─────────┘ └──────────┘ └────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                    Telemetry Logger                              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│                    Supabase (PostgreSQL)                         │
│        conversations │ evaluations │ prompt_improvements         │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### 6 Specialized Evaluation Agents

1. **Coherence Agent** - Scores clarity and logical flow (0-1) using `gpt-5-mini`
2. **Factuality Agent** - Verifies claims via Tavily search, detects hallucinations using `gpt-5.1`
3. **Safety Agent** - Flags toxicity, bias, illegal content, harmful advice using `gpt-5-mini`
4. **Helpfulness Agent** - Scores usefulness, tone, and empathy using `gpt-5-mini`
5. **SOP Compliance Agent** - Validates against configurable rules using `gpt-5-mini`
6. **Prompt Improver Agent** - Suggests refined prompts based on evaluations using `gpt-5-mini`

> **Note**: Model Optimizer agent is currently disabled as it's more useful for real-time routing than post-hoc evaluation.

### Telemetry & Analytics

- Real-time latency tracking
- Token usage monitoring
- Cost breakdown by model
- Safety risk heatmaps
- Model comparison charts

### Dashboard Features

- **Overview** - Key metrics, recent conversations, model distribution
- **Conversations** - Paginated list with search/filters, detailed evaluation traces
- **Test Evaluation** - Manual testing interface for quick evaluations
- **Optimization** - View AI-suggested prompt improvements with before/after comparison
- **Telemetry** - Real-time charts showing token usage, costs, latency distribution, safety heatmaps
- **Settings** - User profile management

All pages connected to real data with Supabase authentication and Row Level Security (RLS).

## Supported Models

AgentOps supports evaluation for the following AI models (January 2025):

### OpenAI Models
**Latest Generation (2025):**
- **GPT-5.2** - Flagship model ($1.75/$14 per 1M tokens)
- **GPT-5.1** - Previous flagship ($1.25/$10 per 1M tokens)
- **GPT-5 Mini** - Balanced quality/cost ($0.25/$2 per 1M tokens)
- **GPT-5 Nano** - Ultra cheap ($0.05/$0.40 per 1M tokens)

**Reasoning Models:**
- **o3-pro** - Premium reasoning ($20/$80 per 1M tokens)
- **o3** - Advanced reasoning ($2/$8 per 1M tokens)
- **o4-mini** - Budget reasoning ($1.10/$4.40 per 1M tokens)

**Legacy:**
- **GPT-4o** - Previous generation ($2.50/$10 per 1M tokens)

### Anthropic Claude Models
**Latest Generation (2025):**
- **Claude Opus 4.5** - Top tier ($5/$25 per 1M tokens)
- **Claude Opus 4.1** - High capability ($15/$75 per 1M tokens)
- **Claude Sonnet 4.5** - Balanced ($3/$15 per 1M tokens)
- **Claude Sonnet 4** - Previous gen ($3/$15 per 1M tokens)
- **Claude Haiku 4.5** - Fast & cheap ($1/$5 per 1M tokens)
- **Claude Haiku 3.5** - Ultra budget ($0.80/$4 per 1M tokens)

### Google Gemini Models
**Latest Generation (2025):**
- **Gemini 3 Pro** - Flagship ($2/$12 per 1M tokens)
- **Gemini 2.5 Pro** - Previous flagship ($1.25/$10 per 1M tokens)
- **Gemini 2.5 Flash** - Fast & cheap ($0.30/$2.50 per 1M tokens)
- **Gemini 2.5 Flash Lite** - Ultra cheap ($0.10/$0.40 per 1M tokens)
- **Gemini 2.0 Flash** - Legacy ($0.10/$0.40 per 1M tokens)

*Pricing format: input/output per 1M tokens (standard tier, no caching). The Model Optimizer agent automatically recommends the most cost-effective model for your use case.*

## Tech Stack

**Backend:**
- Python 3.11+
- FastAPI
- LangGraph
- OpenAI API
- Tavily Search
- Supabase

**Frontend:**
- Next.js 14
- TypeScript
- Tailwind CSS
- Recharts
- Supabase Auth

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase account
- OpenAI API key
- Tavily API key

### 1. Clone and Setup

```bash
git clone <repository>
cd agentops
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your API keys
```

### 3. Database Setup

Run the schema in your Supabase SQL Editor:

```bash
# Copy contents of backend/db/schema.sql to Supabase SQL Editor
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp env.local.example .env.local
# Edit .env.local with your Supabase keys
```

### 5. Run the Application

**Backend:**
```bash
cd backend
uvicorn app:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Access the dashboard at `http://localhost:3000`

## API Reference

### POST /api/evaluate

Evaluate a conversation using all agents.

**Request:**
```json
{
  "conversation": [
    {"role": "user", "content": "What is machine learning?"},
    {"role": "assistant", "content": "Machine learning is..."}
  ],
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "conversation_id": "uuid",
  "coherence": {"score": 0.92, "explanation": "..."},
  "factuality": {"score": 0.88, "hallucination_likelihood": 0.12},
  "safety": {"risk_score": 0.02, "category": "none"},
  "helpfulness": {"score": 0.85, "suggestions": []},
  "sop_compliance": {"compliant": true, "violations": []},
  "model_recommendation": {"recommended_model": "gpt-4o-mini"},
  "prompt_improvement": {"improved_prompt": "...", "reasoning": "..."},
  "telemetry": {"latency_ms": 450, "cost_usd": 0.001}
}
```

### GET /api/conversations

List conversations with pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20)
- `model` - Filter by model
- `min_safety_risk` - Filter by minimum safety risk

### GET /api/conversations/{id}

Get detailed evaluation trace for a conversation.

### POST /api/test-model

Compare models for a given prompt.

**Request:**
```json
{
  "prompt": "Explain quantum computing",
  "models": ["gpt-4o", "gpt-4o-mini"]
}
```

## Configuration

### Environment Variables

**Backend (.env):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
SUPABASE_JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### SOP Rules

Edit `backend/agents/sop_rules.json` to customize compliance rules:

```json
{
  "rules": [
    {
      "id": "SOP-001",
      "name": "Professional Tone",
      "description": "Responses must maintain professional tone",
      "severity": "medium"
    }
  ]
}
```

## Testing

```bash
cd backend
pytest tests/ -v
```

## Seeding Sample Data

```bash
cd backend
python -m scripts.seed_data
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment guide.

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

