"""
Model Routing / Optimization Agent
Suggests optimal model based on task complexity, cost, and latency requirements.
"""
from typing import List
from openai import OpenAI
import json
import tiktoken

from config import get_settings, MODEL_PRICING, MODEL_LATENCY
from db.models import ModelRecommendation, ConversationMessage


OPTIMIZER_SYSTEM_PROMPT = """You are a model routing expert. Your job is to recommend the optimal LLM model for a given task.

Available models (2025):
OpenAI:
- gpt-5.2: Flagship, highest quality ($1.75/$14 per 1M tokens)
- gpt-5-mini: Balanced quality/cost ($0.25/$2 per 1M tokens)
- gpt-5-nano: Ultra cheap, simple tasks ($0.05/$0.40 per 1M tokens)
- o3: Advanced reasoning ($2/$8 per 1M tokens)
- o4-mini: Budget reasoning ($1.10/$4.40 per 1M tokens)

Claude:
- claude-opus-4.5: Top tier ($5/$25 per 1M tokens)
- claude-sonnet-4.5: Balanced ($3/$15 per 1M tokens)
- claude-haiku-4.5: Fast & cheap ($1/$5 per 1M tokens)

Gemini:
- gemini-3-pro: Google flagship ($2/$12 per 1M tokens)
- gemini-2.5-flash: Fast & cheap ($0.30/$2.50 per 1M tokens)
- gemini-2.5-flash-lite: Ultra cheap ($0.10/$0.40 per 1M tokens)

IMPORTANT: Only recommend models from the list above. Do NOT recommend older models like gpt-4o-mini, gpt-3.5-turbo, or gpt-4-turbo.

Consider:
1. Task complexity - Simple Q&A vs complex reasoning
2. Cost sensitivity - Budget constraints
3. Latency requirements - Real-time vs batch
4. Quality requirements - Accuracy importance

Return your recommendation as JSON:
{
    "recommended_model": "model-name",
    "reasoning": "Explanation of why this model is best",
    "complexity_score": 0-1 (how complex the task is),
    "quality_requirement": 0-1 (how important quality is)
}"""


def count_tokens(text: str, model: str = "gpt-4o") -> int:
    """Count tokens in text using tiktoken."""
    try:
        encoding = tiktoken.encoding_for_model(model)
        return len(encoding.encode(text))
    except Exception:
        # Fallback: rough estimate
        return len(text) // 4


def estimate_cost(input_tokens: int, output_tokens: int, model: str) -> float:
    """Estimate cost in USD based on token counts and model."""
    # Pricing is now per 1M tokens (January 2025)
    pricing = MODEL_PRICING.get(model, MODEL_PRICING.get("gpt-5-nano", {"input": 0.05, "output": 0.40}))
    input_cost = (input_tokens / 1_000_000) * pricing["input"]
    output_cost = (output_tokens / 1_000_000) * pricing["output"]
    return round(input_cost + output_cost, 6)


def estimate_latency(input_tokens: int, output_tokens: int, model: str) -> int:
    """Estimate latency in ms based on token counts and model."""
    latency = MODEL_LATENCY.get(model, MODEL_LATENCY.get("gpt-5-nano", {"base": 150, "per_1k": 30}))
    total_tokens = input_tokens + output_tokens
    estimated = latency["base"] + (total_tokens / 1000) * latency["per_1k"]
    return int(estimated)


async def recommend_model(
    conversation: List[ConversationMessage],
    estimated_output_tokens: int = 500,
) -> ModelRecommendation:
    """
    Recommend the optimal model for a conversation.
    
    Args:
        conversation: List of conversation messages
        estimated_output_tokens: Expected output tokens (default 500)
        
    Returns:
        ModelRecommendation with model, cost, and latency estimates
    """
    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)
    
    # Calculate input tokens
    conversation_text = "\n".join([msg.content for msg in conversation])
    input_tokens = count_tokens(conversation_text)
    
    try:
        eval_model = "gpt-5-nano"
        print(f"[Optimizer Agent] Using model: {eval_model}")
        
        response = client.chat.completions.create(
            model=eval_model,  # Cheapest 2025 model for simple routing decisions
            messages=[
                {"role": "system", "content": OPTIMIZER_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Recommend a model for this conversation:\n\n{conversation_text}\n\nReturn ONLY valid JSON, no other text."
                },
            ],
            # Temporarily removed response_format to test if that's causing the issue
            max_completion_tokens=800,  # Increased to ensure complete responses
        )
        
        content = response.choices[0].message.content
        print(f"[Optimizer Agent] Raw response: {content[:100] if content else 'EMPTY'}...")
        
        if not content or content.strip() == "":
            raise ValueError("Empty response from OpenAI API")
        
        result = json.loads(content)
        recommended_model = result.get("recommended_model", "gpt-5-nano")
        
        # Validate model name
        if recommended_model not in MODEL_PRICING:
            recommended_model = "gpt-5-mini"
        
        # Calculate estimates for recommended model
        cost = estimate_cost(input_tokens, estimated_output_tokens, recommended_model)
        latency = estimate_latency(input_tokens, estimated_output_tokens, recommended_model)
        
        # Calculate alternatives (compare against different tiers)
        alternatives = []
        comparison_models = ["gpt-5-nano", "gpt-5-mini", "claude-haiku-4.5", "gemini-2.5-flash"]
        for model in comparison_models:
            if model != recommended_model and model in MODEL_PRICING:
                alt_cost = estimate_cost(input_tokens, estimated_output_tokens, model)
                alt_latency = estimate_latency(input_tokens, estimated_output_tokens, model)
                alternatives.append({
                    "model": model,
                    "cost_estimate": alt_cost,
                    "latency_prediction": alt_latency,
                })
        
        return ModelRecommendation(
            recommended_model=recommended_model,
            cost_estimate=cost,
            latency_prediction=latency,
            reasoning=result.get("reasoning", "Model selected based on task complexity"),
            alternatives=alternatives,
        )
    except Exception as e:
        # Default to gpt-5-nano on error (cheapest option)
        cost = estimate_cost(input_tokens, estimated_output_tokens, "gpt-5-nano")
        latency = estimate_latency(input_tokens, estimated_output_tokens, "gpt-5-nano")
        
        return ModelRecommendation(
            recommended_model="gpt-5-nano",
            cost_estimate=cost,
            latency_prediction=latency,
            reasoning=f"Default selection (optimization failed: {str(e)})",
            alternatives=[],
        )

