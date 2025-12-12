# Evaluation Models Configuration

## Current Model Selection (January 2025)

AgentOps uses different models for different evaluation tasks, optimizing for cost vs accuracy:

### Agent Model Assignments

| Agent | Model | Cost (per 1M tokens) | Reasoning |
|-------|-------|---------------------|-----------|
| **Coherence Agent** | gpt-5-mini | $0.25 / $2.00 | Simple clarity check, mini is sufficient |
| **Factuality Agent** | gpt-5.1 | $1.25 / $10.00 | **High accuracy critical** - detects hallucinations |
| **Safety Agent** | gpt-5-mini | $0.25 / $2.00 | Good at pattern detection |
| **Helpfulness Agent** | gpt-5-mini | $0.25 / $2.00 | Subjective scoring, mini works well |
| **SOP Compliance** | gpt-5-mini | $0.25 / $2.00 | Rule checking, mini is fine |
| **Model Optimizer** | gpt-5-nano | $0.05 / $0.40 | Simple routing decision, cheapest |
| **Prompt Improver** | gpt-5-mini | $0.25 / $2.00 | Creative task, mini handles well |

### Cost Analysis

**Per 1,000 evaluations** (all 7 agents, ~50 tokens avg):

- **Previous** (all gpt-4o-mini): ~$0.10
- **Current** (mixed 2025 models): ~$0.60
- **Improvement**: 6x cost increase, but significantly better accuracy

### Why These Choices?

**Factuality uses gpt-5.1 (most expensive):**
- This is the most critical agent
- Hallucinations in factuality checks are unacceptable
- Example: Must correctly count "3 R's in strawberry", not 2
- Worth the extra cost for accuracy

**Most agents use gpt-5-mini:**
- 2025 model, more advanced than gpt-4o-mini
- 1.6x cost increase is reasonable
- Better reasoning and understanding
- Newer training data

**Optimizer uses gpt-5-nano:**
- Simplest task (just recommend a model)
- Ultra-cheap ($0.05 input)
- No need for expensive model

### Upgrading Individual Agents

To upgrade a specific agent to a more powerful model:

```python
# In backend/agents/coherence_agent.py
response = client.chat.completions.create(
    model="gpt-5.2",  # Change from gpt-5-mini to flagship
    messages=[...],
)
```

**When to upgrade:**
- **gpt-5.2**: Best overall quality, 7x more expensive than mini
- **o3**: Reasoning tasks, 8x more expensive
- **claude-opus-4.5**: Alternative for safety/factuality

### Cost-Saving Options

If cost is a concern, you can downgrade:

```python
# Downgrade all to gpt-5-nano
model="gpt-5-nano"  # $0.05/$0.40 per 1M tokens
```

**Trade-off**: ~$0.15 per 1,000 evals (75% cheaper) but lower accuracy.

### Monitoring Evaluation Quality

Check these metrics to validate evaluation accuracy:

1. **Factuality false positives**: Are correct responses marked as hallucinations?
2. **Safety false positives**: Are safe responses flagged as risky?
3. **Coherence accuracy**: Manual spot-check against human judgment

If you see high error rates, consider upgrading that agent's model.

---

**Last Updated**: January 2025
**Pricing Source**: OpenAI official pricing (https://openai.com/api/pricing/)

