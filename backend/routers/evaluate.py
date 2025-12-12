"""
Evaluation API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel

from db.models import (
    ConversationMessage,
    EvaluationRequest,
    EvaluationResponse,
    ModelTestRequest,
    ModelTestResponse,
)
from middleware.supabase_auth import get_current_user, UserInfo
from agents.orchestrator import run_evaluation_pipeline
from telemetry.logger import TelemetryLogger
from telemetry.tracker import RequestTracker


router = APIRouter()


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_conversation(
    request: EvaluationRequest,
    user: UserInfo = Depends(get_current_user),
):
    """
    Run multi-agent evaluation pipeline on a conversation.
    
    Returns evaluation scores, safety logs, prompt improvement, and telemetry summary.
    """
    tracker = RequestTracker()
    logger = TelemetryLogger()
    
    try:
        with tracker:
            # Run the evaluation pipeline
            result = await run_evaluation_pipeline(
                conversation=request.conversation,
                model=request.model,
                user_id=user.user_id,
                session_id=request.session_id,
            )
            
            # Log telemetry
            conversation_id = await logger.log_conversation(
                user_id=user.user_id,
                session_id=request.session_id,
                conversation=request.conversation,
                model=result.model_used,
                latency_ms=tracker.get_latency_ms(),
                input_tokens=result.input_tokens,
                output_tokens=result.output_tokens,
                cost_usd=result.cost_usd,
            )
            
            await logger.log_evaluation(
                conversation_id=conversation_id,
                evaluation=result,
            )
            
            if result.prompt_improvement:
                await logger.log_prompt_improvement(
                    conversation_id=conversation_id,
                    new_prompt=result.prompt_improvement.improved_prompt,
                    reasoning=result.prompt_improvement.reasoning,
                )
            
            return EvaluationResponse(
                conversation_id=conversation_id,
                coherence=result.coherence,
                factuality=result.factuality,
                safety=result.safety,
                helpfulness=result.helpfulness,
                sop_compliance=result.sop_compliance,
                model_recommendation=result.model_recommendation,
                prompt_improvement=result.prompt_improvement,
                telemetry={
                    "latency_ms": tracker.get_latency_ms(),
                    "input_tokens": result.input_tokens,
                    "output_tokens": result.output_tokens,
                    "cost_usd": result.cost_usd,
                    "model_used": result.model_used,
                },
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test-model", response_model=ModelTestResponse)
async def test_model_comparison(
    request: ModelTestRequest,
    user: UserInfo = Depends(get_current_user),
):
    """
    Run a test prompt across multiple models and compare results.
    
    Compares latency, cost, accuracy, and evaluator scores.
    """
    from agents.orchestrator import run_model_comparison
    
    try:
        results = await run_model_comparison(
            prompt=request.prompt,
            models=request.models or ["gpt-4o", "gpt-4o-mini"],
            user_id=user.user_id,
        )
        
        return ModelTestResponse(
            results=results,
            recommendation=results[0] if results else None,  # Best performing model
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

