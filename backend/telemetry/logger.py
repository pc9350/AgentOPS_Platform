"""
Telemetry Logger
Captures and stores evaluation metrics in Supabase.
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from db.supabase_client import get_supabase_client
from db.models import ConversationMessage, EvaluationResult


class TelemetryLogger:
    """Logger for conversation and evaluation telemetry."""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def log_conversation(
        self,
        user_id: str,
        session_id: Optional[str],
        conversation: List[ConversationMessage],
        model: str,
        latency_ms: int,
        input_tokens: int,
        output_tokens: int,
        cost_usd: float,
    ) -> UUID:
        """
        Log a conversation to the database.
        
        Returns:
            UUID of the created conversation record
        """
        # Extract user input and model output
        user_messages = [msg for msg in conversation if msg.role == "user"]
        assistant_messages = [msg for msg in conversation if msg.role == "assistant"]
        
        user_input = user_messages[-1].content if user_messages else ""
        model_output = assistant_messages[-1].content if assistant_messages else ""
        
        data = {
            "user_id": user_id,
            "session_id": session_id,
            "user_input": user_input,
            "model_output": model_output,
            "model": model,
            "latency_ms": latency_ms,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": cost_usd,
        }
        
        result = self.supabase.table("conversations").insert(data).execute()
        
        return UUID(result.data[0]["id"])
    
    async def log_evaluation(
        self,
        conversation_id: UUID,
        evaluation: EvaluationResult,
    ) -> UUID:
        """
        Log evaluation results to the database.
        
        Returns:
            UUID of the created evaluation record
        """
        # Build evaluator details JSON
        evaluator_details = {
            "coherence": {
                "score": evaluation.coherence.score,
                "explanation": evaluation.coherence.explanation,
            },
            "factuality": {
                "score": evaluation.factuality.score,
                "hallucination_likelihood": evaluation.factuality.hallucination_likelihood,
                "corrected_facts": evaluation.factuality.corrected_facts,
                "sources_checked": evaluation.factuality.sources_checked,
            },
            "safety": {
                "risk_score": evaluation.safety.risk_score,
                "category": evaluation.safety.category.value,
                "explanation": evaluation.safety.explanation,
                "recommended_fix": evaluation.safety.recommended_fix,
            },
            "helpfulness": {
                "score": evaluation.helpfulness.score,
                "usefulness_score": evaluation.helpfulness.usefulness_score,
                "tone_score": evaluation.helpfulness.tone_score,
                "empathy_score": evaluation.helpfulness.empathy_score,
                "suggestions": evaluation.helpfulness.suggestions,
            },
            "model_recommendation": {
                "recommended_model": evaluation.model_recommendation.recommended_model,
                "cost_estimate": evaluation.model_recommendation.cost_estimate,
                "latency_prediction": evaluation.model_recommendation.latency_prediction,
                "reasoning": evaluation.model_recommendation.reasoning,
            },
        }
        
        # Build SOP violations JSON
        sop_violations = [
            {
                "rule_id": v.rule_id,
                "rule_name": v.rule_name,
                "severity": v.severity,
                "description": v.description,
            }
            for v in evaluation.sop_compliance.violations
        ]
        
        data = {
            "conversation_id": str(conversation_id),
            "coherence_score": evaluation.coherence.score,
            "factuality_score": evaluation.factuality.score,
            "helpfulness_score": evaluation.helpfulness.score,
            "safety_risk": evaluation.safety.risk_score,
            "sop_violations": sop_violations,
            "evaluator_details": evaluator_details,
        }
        
        result = self.supabase.table("evaluations").insert(data).execute()
        
        return UUID(result.data[0]["id"])
    
    async def log_prompt_improvement(
        self,
        conversation_id: UUID,
        new_prompt: str,
        reasoning: str,
    ) -> UUID:
        """
        Log a prompt improvement suggestion.
        
        Returns:
            UUID of the created prompt improvement record
        """
        data = {
            "conversation_id": str(conversation_id),
            "new_prompt": new_prompt,
            "reasoning": reasoning,
        }
        
        result = self.supabase.table("prompt_improvements").insert(data).execute()
        
        return UUID(result.data[0]["id"])

