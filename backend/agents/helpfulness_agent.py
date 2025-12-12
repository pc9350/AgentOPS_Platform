"""
Helpfulness Agent
Scores usefulness, tone, and empathy of responses.
"""
from typing import List
from openai import OpenAI
import json

from config import get_settings
from db.models import HelpfulnessResult, ConversationMessage


HELPFULNESS_SYSTEM_PROMPT = """You are an expert evaluator assessing how helpful an AI assistant's response is.

Evaluate the response on:
1. **Usefulness** (0-1): Does it actually help the user accomplish their goal?
2. **Tone** (0-1): Is the tone appropriate for the context? Professional yet friendly?
3. **Empathy** (0-1): Does it acknowledge the user's situation/feelings when relevant?
4. **Actionability**: Does it provide clear next steps when appropriate?

Also provide specific suggestions for improvement.

Provide your evaluation as JSON with:
- score: Overall helpfulness score 0-1
- usefulness_score: How useful the response is (0-1)
- tone_score: Appropriateness of tone (0-1)
- empathy_score: Level of empathy shown (0-1)
- suggestions: Array of specific improvement suggestions

Example output:
{
    "score": 0.8,
    "usefulness_score": 0.85,
    "tone_score": 0.9,
    "empathy_score": 0.7,
    "suggestions": ["Could acknowledge the user's frustration", "Add more specific examples"]
}"""


async def evaluate_helpfulness(
    conversation: List[ConversationMessage],
) -> HelpfulnessResult:
    """
    Evaluate the helpfulness of a conversation response.
    
    Args:
        conversation: List of conversation messages
        
    Returns:
        HelpfulnessResult with scores and suggestions
    """
    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)
    
    # Format conversation
    conversation_text = "\n".join([
        f"{msg.role.upper()}: {msg.content}"
        for msg in conversation
    ])
    
    try:
        eval_model = "gpt-5-mini"
        print(f"[Helpfulness Agent] Using model: {eval_model}")
        
        response = client.chat.completions.create(
            model=eval_model,  # 2025 model - better than gpt-4o-mini
            messages=[
                {"role": "system", "content": HELPFULNESS_SYSTEM_PROMPT},
                {"role": "user", "content": f"Evaluate the helpfulness of this conversation:\n\n{conversation_text}\n\nReturn ONLY valid JSON, no other text."},
            ],
            # Temporarily removed response_format to test if that's causing the issue
            max_completion_tokens=1200,  # Increased to ensure complete responses
        )
        
        content = response.choices[0].message.content
        print(f"[Helpfulness Agent] Raw response: {content[:100]}...")
        
        if not content or content.strip() == "":
            raise ValueError("Empty response from OpenAI API")
        
        result = json.loads(content)
        
        return HelpfulnessResult(
            score=max(0, min(1, float(result.get("score", 0.5)))),
            usefulness_score=max(0, min(1, float(result.get("usefulness_score", 0.5)))),
            tone_score=max(0, min(1, float(result.get("tone_score", 0.5)))),
            empathy_score=max(0, min(1, float(result.get("empathy_score", 0.5)))),
            suggestions=result.get("suggestions", []),
        )
    except Exception as e:
        return HelpfulnessResult(
            score=0.5,
            usefulness_score=0.5,
            tone_score=0.5,
            empathy_score=0.5,
            suggestions=[f"Evaluation failed: {str(e)}"],
        )

