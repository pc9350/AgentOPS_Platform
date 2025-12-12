# AgentOps Backend

FastAPI backend for the AgentOps multi-agent evaluation platform.

## Structure

```
backend/
├── app.py                 # FastAPI application entry point
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── agents/                # Evaluation agents
│   ├── orchestrator.py    # LangGraph workflow
│   ├── coherence_agent.py
│   ├── factuality_agent.py
│   ├── safety_agent.py
│   ├── helpfulness_agent.py
│   ├── sop_agent.py
│   ├── optimizer_agent.py
│   ├── prompt_improver.py
│   └── sop_rules.json     # SOP compliance rules
├── db/                    # Database layer
│   ├── schema.sql         # PostgreSQL schema
│   ├── supabase_client.py # Supabase connection
│   └── models.py          # Pydantic models
├── middleware/            # Auth middleware
│   └── supabase_auth.py   # JWT validation
├── routers/               # API routes
│   ├── evaluate.py        # Evaluation endpoints
│   └── conversations.py   # Conversation endpoints
├── telemetry/             # Logging & tracking
│   ├── logger.py          # Telemetry logging
│   └── tracker.py         # Request tracking
├── tests/                 # Unit tests
└── scripts/               # Utility scripts
    └── seed_data.py       # Database seeding
```

## API Endpoints

### Evaluation

- `POST /api/evaluate` - Run full evaluation pipeline
- `POST /api/test-model` - Compare models

### Conversations

- `GET /api/conversations` - List conversations
- `GET /api/conversations/{id}` - Get conversation details
- `GET /api/conversations/stats/overview` - Dashboard stats

### Health

- `GET /` - API info
- `GET /health` - Health check

## Running Locally

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your API keys

# Run server
uvicorn app:app --reload --port 8000
```

## Testing

```bash
pytest tests/ -v
```

## Seeding Data

```bash
python -m scripts.seed_data
```

## Configuration

Environment variables (`.env`):

| Variable | Description |
|----------|-------------|
| SUPABASE_URL | Supabase project URL |
| SUPABASE_PUBLISHABLE_KEY | Supabase publishable key |
| SUPABASE_SECRET_KEY | Supabase secret key (keep private!) |
| SUPABASE_JWT_SECRET | JWT secret for auth |
| OPENAI_API_KEY | OpenAI API key |
| TAVILY_API_KEY | Tavily API key |
| CORS_ORIGINS | Allowed CORS origins |
| DEBUG | Enable debug mode |

## Agents

### Coherence Agent
Evaluates response clarity and logical flow.

### Factuality Agent
Verifies claims using Tavily web search.

### Safety Agent
Detects toxicity, bias, illegal content, harmful advice.

### Helpfulness Agent
Scores usefulness, tone, and empathy.

### SOP Compliance Agent
Checks against configurable rules in `sop_rules.json`.

### Model Optimizer
Recommends optimal model based on task complexity.

### Prompt Improver
Suggests refined prompts based on evaluation results.

## Adding Custom SOP Rules

Edit `agents/sop_rules.json`:

```json
{
  "rules": [
    {
      "id": "CUSTOM-001",
      "name": "Your Rule Name",
      "description": "Rule description",
      "severity": "medium",
      "check": "What to check for"
    }
  ]
}
```

## Model Pricing

Configured in `config.py`:

| Model | Input (per 1K) | Output (per 1K) |
|-------|----------------|-----------------|
| gpt-4o | $0.005 | $0.015 |
| gpt-4o-mini | $0.00015 | $0.0006 |

