"""
Coherence Evaluator Agent
Scores clarity and logical flow of responses.
"""
from typing import List
from openai import OpenAI
import json

from config import get_settings
from db.models import CoherenceResult, ConversationMessage


COHERENCE_SYSTEM_PROMPT = """You are an expert evaluator assessing the coherence of AI assistant responses.

Evaluate the response for:
1. **Clarity**: Is the language clear and easy to understand?
2. **Logical Flow**: Does the response follow a logical structure?
3. **Consistency**: Is the response internally consistent?
4. **Relevance**: Does the response directly address the user's query?
5. **Completeness**: Does the response fully answer the question?

Provide your evaluation as JSON with:
- score: A number between 0 and 1 (1 being perfectly coherent)
- explanation: A brief explanation of your assessment

Example output:
{
    "score": 0.85,
    "explanation": "The response is clear and well-structured, but could improve on..."
}"""


async def evaluate_coherence(
    conversation: List[ConversationMessage],
) -> CoherenceResult:
    """
    Evaluate the coherence of a conversation response.
    
    Args:
        conversation: List of conversation messages
        
    Returns:
        CoherenceResult with score and explanation
    """
    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)
    
    # Format conversation for evaluation
    conversation_text = "\n".join([
        f"{msg.role.upper()}: {msg.content}"
        for msg in conversation
    ])
    
    try:
        eval_model = "gpt-5-mini"
        print(f"[Coherence Agent] Using model: {eval_model}")
        response = client.chat.completions.create(
            model=eval_model, 
            messages=[
                {"role": "system", "content": COHERENCE_SYSTEM_PROMPT},
                {"role": "user", "content": f"Evaluate the coherence of this conversation:\n\n{conversation_text}"},
            ],
            response_format={"type": "json_object"},
            max_completion_tokens=500,  # GPT-5 models - no custom temperature allowed
        )
        
        result = json.loads(response.choices[0].message.content)
        
        return CoherenceResult(
            score=max(0, min(1, float(result.get("score", 0.5)))),
            explanation=result.get("explanation", "No explanation provided"),
        )
    except Exception as e:
        # Return default result on error
        return CoherenceResult(
            score=0.5,
            explanation=f"Evaluation failed: {str(e)}",
        )

