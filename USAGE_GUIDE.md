# AgentOps Platform - Usage Guide

## What Is AgentOps?

AgentOps is a **monitoring and evaluation system** for AI applications. It's like having a QA team that automatically checks every AI response for quality, safety, and compliance.

## Real-World Use Cases

### 1. Customer Support Chatbot
**Scenario:** You built a customer support chatbot for your SaaS product.

**How AgentOps helps:**
```
Customer asks → Your chatbot responds → Send to AgentOps API

AgentOps returns:
✅ Coherence: 0.92 (response is clear)
⚠️ Safety Risk: 0.15 (low risk)
✅ Helpfulness: 0.88 (actually helpful)
❌ SOP Violation: Response didn't include ticket number
💡 Prompt Improvement: "Add instruction to always include ticket numbers"
```

You can:
- Monitor all conversations in the dashboard
- Get alerts when safety scores are high
- See which prompts perform best
- Track costs per conversation

---

### 2. Content Generation Platform
**Scenario:** You have a tool that generates blog posts for users.

**How AgentOps helps:**
```
User: "Write about climate change"
AI: [generates 500-word article]
→ Send to AgentOps

AgentOps checks:
✅ Factuality: 0.78 ⚠️ (Found 2 unverified claims via web search)
✅ Coherence: 0.94 (Well structured)
💡 Suggests: "Add sources: IPCC 2023 report"
```

Benefits:
- Catch factual errors before publishing
- Improve content quality over time
- Monitor AI hallucinations

---

### 3. Internal AI Assistant
**Scenario:** Your company uses an AI assistant for employee questions.

**How AgentOps helps:**
```
Employee: "What's our vacation policy?"
AI: [responds with policy details]
→ Send to AgentOps

AgentOps validates:
✅ SOP Compliance: Checked against HR policy docs
⚠️ Completeness: Missing information about rollover days
💡 Optimization: "GPT-4o-mini is sufficient, save $0.02 per query"
```

Track:
- Which departments use it most
- What questions get asked
- Cost per department
- Quality trends over time

---

## How To Use It

### Option 1: Manual Testing (Try It Now!)

1. Go to dashboard → **Test Evaluation** page
2. Enter any user question and AI response
3. Click "Evaluate"
4. See instant quality scores and suggestions!

**Example to try:**
```
User Message: "What causes earthquakes?"

AI Response: "Earthquakes happen when tectonic plates suddenly shift. 
The Earth's crust is made of several large plates that float on molten rock. 
When they grind against each other, pressure builds up and eventually releases 
as an earthquake. This usually happens along fault lines."

Click "Evaluate" → See coherence, factuality, helpfulness scores!
```

---

### Option 2: Integrate Into Your App

#### Step 1: Send conversations to AgentOps API

```python
import httpx

async def evaluate_conversation(user_input: str, ai_output: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/api/evaluate",
            json={
                "messages": [
                    {"role": "user", "content": user_input},
                    {"role": "assistant", "content": ai_output}
                ],
                "model": "gpt-4o-mini",
                "session_id": "user-123-session-456"
            }
        )
        return response.json()

# Use it in your chatbot
user_question = "How do I reset my password?"
ai_answer = generate_ai_response(user_question)  # Your existing AI logic

# Evaluate the response
evaluation = await evaluate_conversation(user_question, ai_answer)

print(f"Coherence: {evaluation['evaluation']['coherence_score']}")
print(f"Safety Risk: {evaluation['evaluation']['safety_risk']}")

if evaluation['evaluation']['safety_risk'] > 0.7:
    # Don't show this response to the user!
    ai_answer = "I apologize, but I can't help with that."
```

#### Step 2: View results in dashboard

All evaluations are saved and visible in:
- **Conversations** page - See all evaluated conversations
- **Telemetry** page - Charts showing trends over time
- **Optimization** page - Prompt improvement suggestions

---

### Option 3: Batch Evaluation

Test multiple conversations at once:

```python
# backend/scripts/batch_evaluate.py
import asyncio
import httpx

test_cases = [
    {
        "user": "What's 2+2?",
        "ai": "2+2 equals 4.",
        "expected_coherence": 1.0
    },
    {
        "user": "Explain quantum physics",
        "ai": "Quantum physics is like... um... cats?",
        "expected_coherence": 0.3  # Should be low!
    },
]

async def run_batch():
    async with httpx.AsyncClient() as client:
        for case in test_cases:
            result = await client.post(
                "http://localhost:8000/api/evaluate",
                json={
                    "messages": [
                        {"role": "user", "content": case["user"]},
                        {"role": "assistant", "content": case["ai"]}
                    ],
                    "model": "gpt-4o-mini"
                }
            )
            print(f"Coherence: {result.json()['evaluation']['coherence_score']}")

asyncio.run(run_batch())
```

---

## Understanding The Dashboard

### 📊 Overview Page
- **Total Conversations**: How many you've evaluated
- **Avg Scores**: Overall quality trends
- **Cost Breakdown**: How much you're spending on evaluations
- **Recent Conversations**: Latest evaluations

### 💬 Conversations Page
- **All evaluated conversations** in a searchable table
- Click any row to see full evaluation details
- Filter by date, model, or scores

### 🧪 Test Evaluation Page
- **Manual testing interface**
- Enter user message + AI response
- Get instant evaluation
- Perfect for testing prompt changes

### 💡 Optimization Page
- **Prompt improvement suggestions**
- Shows before/after scores
- Explains why improvements help
- Model recommendations (save money!)

### 📈 Telemetry Page
- **Charts and metrics**
- Token usage over time
- Latency trends
- Cost analysis
- Safety risk heatmap

---

## What Gets Evaluated?

### 1. **Coherence Score** (0-1)
- Is the response clear and logical?
- Does it make sense?
- Good grammar and structure?

**Example:**
- "The sky is blue because of Rayleigh scattering" → 0.95 ✅
- "Sky blue because um particles and stuff" → 0.45 ❌

### 2. **Factuality Score** (0-1)
- Are claims accurate?
- Uses **web search** to verify facts
- Detects hallucinations

**Example:**
- "Paris is the capital of France" → 1.0 ✅
- "Paris is the capital of Germany" → 0.1 ❌ (Hallucination detected!)

### 3. **Helpfulness Score** (0-1)
- Does it actually answer the question?
- Is it useful to the user?
- Appropriate tone?

**Example:**
- User: "How to bake bread?" → AI gives recipe → 0.95 ✅
- User: "How to bake bread?" → AI: "Google it" → 0.2 ❌

### 4. **Safety Risk** (0-1, lower is better)
- Toxic language?
- Biased content?
- Illegal/harmful advice?

**Example:**
- Normal customer support response → 0.05 ✅
- Response with profanity → 0.8 ⚠️

### 5. **SOP Compliance**
- Does it follow your rules?
- Custom per-company
- Upload your policies as JSON

### 6. **Prompt Improvements**
- AI suggests better prompts
- Shows expected score improvements
- Explains reasoning

### 7. **Model Optimization**
- "Use GPT-4o-mini instead of GPT-4o"
- Save 90% on costs for simple queries
- Maintains similar quality

---

## Cost & Performance

### Evaluation Costs
- AgentOps uses OpenAI API to evaluate responses
- Cost per evaluation: **~$0.001 - $0.003** (depending on response length)
- 1,000 evaluations ≈ $2-3

### When To Evaluate
**Evaluate every response:**
- Production chatbots (monitor quality)
- High-risk applications (medical, legal, financial)

**Sample evaluation (10-20%):**
- Low-risk content generation
- Cost-sensitive applications

**Batch evaluation:**
- After prompt changes (test improvements)
- Weekly quality audits

---

## Troubleshooting

### "500 Internal Server Error"
**Cause:** Backend can't reach OpenAI or Supabase.

**Fix:**
1. Check `backend/.env` has valid API keys
2. Test OpenAI key: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`
3. Check Supabase connection in dashboard

### "No data showing in dashboard"
**Cause:** Haven't evaluated any conversations yet.

**Fix:**
1. Go to **Test Evaluation** page
2. Enter sample conversation
3. Click "Evaluate"
4. Refresh **Conversations** page

### "Evaluation takes too long"
**Cause:** Factuality agent does web searches (slower).

**Fix:**
- Use faster models for evaluation (GPT-4o-mini)
- Disable factuality agent for real-time applications
- Run evaluations async/background

---

## Next Steps

1. ✅ **Try the Test Evaluation page** with sample conversations
2. 📚 **Read your SOP rules** into `backend/agents/sop_rules.json`
3. 🔗 **Integrate the API** into your application
4. 📊 **Monitor the dashboard** for quality trends
5. 💡 **Apply prompt improvements** from optimization suggestions

---

## Need Help?

- 📖 Check `README.md` for setup instructions
- 🏗️ See `cursor-plan://...plan.md` for architecture details
- 🚀 Review `DEPLOYMENT.md` for production deployment
- 💬 File issues on GitHub

---

**Remember:** AgentOps is a monitoring tool, not a chatbot. It **evaluates** conversations from your AI applications!

