# AgentOps Frontend

Next.js dashboard for the AgentOps multi-agent evaluation platform.

## Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   ├── auth/callback/        # Auth callback handler
│   └── (dashboard)/          # Protected dashboard routes
│       ├── layout.tsx        # Dashboard layout
│       ├── page.tsx          # Overview page
│       ├── conversations/    # Conversations pages
│       ├── optimization/     # Optimization page
│       ├── telemetry/        # Telemetry page
│       ├── settings/         # Settings page
│       └── help/             # Help page
├── components/               # React components
│   ├── charts/               # Chart components
│   ├── tables/               # Table components
│   ├── ui/                   # UI components
│   └── layout/               # Layout components
├── lib/                      # Utilities
│   ├── supabase.ts           # Supabase client
│   ├── api-client.ts         # API client
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Helper functions
└── middleware.ts             # Auth middleware
```

## Pages

- **Overview** (`/`) - Dashboard with key metrics
- **Conversations** (`/conversations`) - Browse all conversations
- **Conversation Detail** (`/conversations/[id]`) - Full evaluation trace
- **Optimization** (`/optimization`) - Prompt improvements
- **Telemetry** (`/telemetry`) - Detailed analytics
- **Settings** (`/settings`) - Account settings
- **Help** (`/help`) - Documentation

## Running Locally

```bash
# Install dependencies
npm install

# Configure environment
cp env.local.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

## Building

```bash
npm run build
npm start
```

## Configuration

Environment variables (`.env.local`):

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Supabase publishable key |
| NEXT_PUBLIC_API_URL | Backend API URL |

## Components

### Charts

- `StatsCard` - Metric display with trends
- `ModelDistributionChart` - Pie chart for model usage
- `LatencyChart` - Line/area chart for latency
- `SafetyHeatmap` - Risk visualization by category

### Tables

- `ConversationsTable` - Sortable conversation list
- `Pagination` - Pagination controls

### UI

- `ScoreBadge` - Color-coded score display
- `ScoreBar` - Progress bar for scores
- `SafetyAlert` - Risk warning display

### Layout

- `Sidebar` - Navigation sidebar
- `Header` - Page header with user menu

## Styling

Uses Tailwind CSS with custom theme:

- Primary colors: Blue (`primary-*`)
- Accent colors: Purple (`accent-*`)
- Surface colors: Slate (`surface-*`)
- Status colors: `success`, `warning`, `danger`

Custom classes:
- `.card` - Card container
- `.btn`, `.btn-primary`, `.btn-secondary` - Buttons
- `.input` - Form inputs
- `.badge` - Status badges

## Authentication Flow

1. User visits protected route
2. Middleware checks Supabase session
3. Redirects to `/login` if not authenticated
4. After login, redirects back to original route
5. API client automatically attaches JWT to requests

## API Integration

The `api-client.ts` handles:
- Automatic auth token injection
- Error handling
- Type-safe responses

Usage:
```typescript
import { agentOpsApi } from '@/lib/api-client'

// Fetch data
const stats = await agentOpsApi.getDashboardStats()
const conversations = await agentOpsApi.getConversations({ page: 1 })
const detail = await agentOpsApi.getConversation(id)

// Evaluate
const result = await agentOpsApi.evaluate({
  conversation: [
    { role: 'user', content: '...' },
    { role: 'assistant', content: '...' }
  ]
})
```

