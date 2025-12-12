"""
Prompt Improvement Agent
Synthesizes evaluation results and suggests improved prompts.
"""
from typing import List, Optional
from openai import OpenAI
import json

from config import get_settings
from db.models import (
    PromptImprovement,
    ConversationMessage,
    CoherenceResult,
    FactualityResult,
    SafetyResult,
    HelpfulnessResult,
    SOPComplianceResult,
)


PROMPT_IMPROVER_SYSTEM_PROMPT = """You are an expert prompt engineer. Your job is to improve prompts based on evaluation feedback.

You will receive:
1. The original user prompt
2. The AI's response
3. Evaluation results from multiple evaluators (coherence, factuality, safety, helpfulness, SOP compliance)

Your task:
1. Analyze what could be improved in the original prompt
2. Create an improved version that would lead to better responses
3. Explain your changes

Return your output as JSON:
{
    "improved_prompt": "The new, improved prompt",
    "reasoning": "Explanation of why these changes would help",
    "changes_made": ["List of specific changes", "Another change"]
}

Focus on:
- Making the prompt clearer and more specific
- Adding constraints based on safety/SOP feedback
- Requesting citations or sources if factuality was low
- Adding tone/style guidance if helpfulness was low"""


async def improve_prompt(
    conversation: List[ConversationMessage],
    coherence: CoherenceResult,
    factuality: FactualityResult,
    safety: SafetyResult,
    helpfulness: HelpfulnessResult,
    sop_compliance: SOPComplianceResult,
) -> Optional[PromptImprovement]:
    """
    Generate an improved prompt based on evaluation results.
    
    Args:
        conversation: Original conversation
        coherence: Coherence evaluation result
        factuality: Factuality evaluation result
        safety: Safety evaluation result
        helpfulness: Helpfulness evaluation result
        sop_compliance: SOP compliance result
        
    Returns:
        PromptImprovement with improved prompt and reasoning, or None if no improvement needed
    """
    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)
    
    # Get the original user prompt
    user_messages = [msg for msg in conversation if msg.role == "user"]
    if not user_messages:
        return None
    
    original_prompt = user_messages[-1].content
    
    # Get the assistant response
    assistant_messages = [msg for msg in conversation if msg.role == "assistant"]
    assistant_response = assistant_messages[-1].content if assistant_messages else "No response"
    
    # Check if improvement is needed (average score below threshold)
    avg_score = (
        coherence.score + 
        factuality.score + 
        helpfulness.score + 
        (1 - safety.risk_score)  # Invert safety risk
    ) / 4
    
    # Compile evaluation summary
    evaluation_summary = {
        "coherence": {
            "score": coherence.score,
            "explanation": coherence.explanation,
        },
        "factuality": {
            "score": factuality.score,
            "hallucination_likelihood": factuality.hallucination_likelihood,
            "corrected_facts": factuality.corrected_facts,
        },
        "safety": {
            "risk_score": safety.risk_score,
            "category": safety.category.value,
            "recommended_fix": safety.recommended_fix,
        },
        "helpfulness": {
            "score": helpfulness.score,
            "suggestions": helpfulness.suggestions,
        },
        "sop_compliance": {
            "compliant": sop_compliance.compliant,
            "violations": [
                {"rule": v.rule_name, "severity": v.severity, "description": v.description}
                for v in sop_compliance.violations
            ],
        },
    }
    
    try:
        eval_model = "gpt-5-mini"
        print(f"[Prompt Improver Agent] Using model: {eval_model}")
        
        response = client.chat.completions.create(
            model=eval_model,  # 2025 model - better prompt engineering
            messages=[
                {"role": "system", "content": PROMPT_IMPROVER_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"""Original prompt: {original_prompt}

AI Response: {assistant_response}

Evaluation Results:
{json.dumps(evaluation_summary, indent=2)}

Please suggest an improved prompt."""
                },
            ],
            response_format={"type": "json_object"},
            max_completion_tokens=1500,  # Increased to ensure complete responses
        )
        
        content = response.choices[0].message.content
        print(f"[Prompt Improver Agent] Raw response: {content[:100] if content else 'EMPTY'}...")
        
        if not content or content.strip() == "":
            raise ValueError("Empty response from OpenAI API")
        
        result = json.loads(content)
        
        improved_prompt = result.get("improved_prompt", "")
        
        # Only return improvement if it's meaningfully different
        if improved_prompt and improved_prompt != original_prompt:
            return PromptImprovement(
                improved_prompt=improved_prompt,
                reasoning=result.get("reasoning", "Improvements based on evaluation feedback"),
                changes_made=result.get("changes_made", []),
            )
        
        return None
        
    except Exception as e:
        return PromptImprovement(
            improved_prompt=original_prompt,
            reasoning=f"Could not generate improvement: {str(e)}",
            changes_made=[],
        )

