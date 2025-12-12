"""
LangGraph Orchestrator
Coordinates multi-agent evaluation pipeline with parallel execution.
"""
from typing import List, Dict, Any, TypedDict, Optional
import asyncio
from langgraph.graph import StateGraph, END
from openai import OpenAI
import tiktoken

from config import get_settings
from db.models import (
    ConversationMessage,
    EvaluationResult,
    CoherenceResult,
    FactualityResult,
    SafetyResult,
    HelpfulnessResult,
    SOPComplianceResult,
    ModelRecommendation,
    PromptImprovement,
    ModelComparisonResult,
)
from agents.coherence_agent import evaluate_coherence
from agents.factuality_agent import evaluate_factuality
from agents.safety_agent import evaluate_safety
from agents.helpfulness_agent import evaluate_helpfulness
from agents.sop_agent import evaluate_sop_compliance
from agents.optimizer_agent import recommend_model, count_tokens, estimate_cost


class EvaluationState(TypedDict):
    """State for the evaluation pipeline."""
    conversation: List[ConversationMessage]
    user_id: str
    session_id: Optional[str]
    
    # Evaluation results
    coherence: Optional[CoherenceResult]
    factuality: Optional[FactualityResult]
    safety: Optional[SafetyResult]
    helpfulness: Optional[HelpfulnessResult]
    sop_compliance: Optional[SOPComplianceResult]
    model_recommendation: Optional[ModelRecommendation]
    prompt_improvement: Optional[PromptImprovement]
    
    # Telemetry
    model_used: str
    input_tokens: int
    output_tokens: int
    cost_usd: float


async def parallel_evaluations(state: EvaluationState) -> EvaluationState:
    """Run core evaluations in parallel."""
    conversation = state["conversation"]
    
    # Run evaluations concurrently
    coherence_task = evaluate_coherence(conversation)
    factuality_task = evaluate_factuality(conversation)
    safety_task = evaluate_safety(conversation)
    helpfulness_task = evaluate_helpfulness(conversation)
    sop_task = evaluate_sop_compliance(conversation)
    
    results = await asyncio.gather(
        coherence_task,
        factuality_task,
        safety_task,
        helpfulness_task,
        sop_task,
    )
    
    return {
        **state,
        "coherence": results[0],
        "factuality": results[1],
        "safety": results[2],
        "helpfulness": results[3],
        "sop_compliance": results[4],
    }


async def optimize_model(state: EvaluationState) -> EvaluationState:
    """Run model optimization."""
    conversation = state["conversation"]
    recommendation = await recommend_model(conversation)
    
    return {
        **state,
        "model_recommendation": recommendation,
    }


async def improve_prompt_step(state: EvaluationState) -> EvaluationState:
    """Run prompt improvement."""
    from agents.prompt_improver import improve_prompt
    
    improvement = await improve_prompt(
        conversation=state["conversation"],
        coherence=state["coherence"],
        factuality=state["factuality"],
        safety=state["safety"],
        helpfulness=state["helpfulness"],
        sop_compliance=state["sop_compliance"],
    )
    
    return {
        **state,
        "prompt_improvement": improvement,
    }


def calculate_telemetry(state: EvaluationState) -> EvaluationState:
    """Calculate final telemetry metrics."""
    # Count tokens from conversation
    conversation_text = "\n".join([msg.content for msg in state["conversation"]])
    input_tokens = count_tokens(conversation_text)
    
    # Estimate output tokens based on response
    assistant_messages = [msg for msg in state["conversation"] if msg.role == "assistant"]
    output_text = assistant_messages[-1].content if assistant_messages else ""
    output_tokens = count_tokens(output_text)
    
    # Use the model from state (passed in from request)
    model = state.get("model_used", "gpt-5-nano")
    
    cost = estimate_cost(input_tokens, output_tokens, model)
    
    return {
        **state,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_usd": cost,
    }


def build_evaluation_graph() -> StateGraph:
    """Build the LangGraph evaluation workflow."""
    
    # Create graph
    workflow = StateGraph(EvaluationState)
    
    # Add nodes
    workflow.add_node("parallel_evaluations", parallel_evaluations)
    # Note: optimize_model node disabled - not needed for post-hoc conversation evaluation
    workflow.add_node("improve_prompt", improve_prompt_step)
    workflow.add_node("calculate_telemetry", calculate_telemetry)
    
    # Define edges (workflow)
    workflow.set_entry_point("parallel_evaluations")
    workflow.add_edge("parallel_evaluations", "improve_prompt")  # Skip optimizer
    workflow.add_edge("improve_prompt", "calculate_telemetry")
    workflow.add_edge("calculate_telemetry", END)
    
    return workflow.compile()


async def run_evaluation_pipeline(
    conversation: List[ConversationMessage],
    model: str,
    user_id: str,
    session_id: Optional[str] = None,
) -> EvaluationResult:
    """
    Run the full evaluation pipeline.
    
    Args:
        conversation: List of conversation messages
        model: The model that generated this conversation
        user_id: ID of the authenticated user
        session_id: Optional session ID for tracking
        
    Returns:
        EvaluationResult with all evaluation scores
    """
    # Build and run the graph
    graph = build_evaluation_graph()
    
    initial_state: EvaluationState = {
        "conversation": conversation,
        "user_id": user_id,
        "session_id": session_id,
        "coherence": None,
        "factuality": None,
        "safety": None,
        "helpfulness": None,
        "sop_compliance": None,
        "model_recommendation": None,
        "prompt_improvement": None,
        "model_used": model,
        "input_tokens": 0,
        "output_tokens": 0,
        "cost_usd": 0.0,
    }
    
    # Run the graph
    final_state = await graph.ainvoke(initial_state)
    
    # Build result
    return EvaluationResult(
        coherence=final_state["coherence"],
        factuality=final_state["factuality"],
        safety=final_state["safety"],
        helpfulness=final_state["helpfulness"],
        sop_compliance=final_state["sop_compliance"],
        model_recommendation=None,  # Optimizer disabled - not needed for post-hoc evaluation
        prompt_improvement=final_state["prompt_improvement"],
        model_used=final_state["model_used"],
        input_tokens=final_state["input_tokens"],
        output_tokens=final_state["output_tokens"],
        cost_usd=final_state["cost_usd"],
    )


async def run_model_comparison(
    prompt: str,
    models: List[str],
    user_id: str,
) -> List[ModelComparisonResult]:
    """
    Run a prompt across multiple models and compare results.
    
    Args:
        prompt: The prompt to test
        models: List of model IDs to test
        user_id: ID of the authenticated user
        
    Returns:
        List of ModelComparisonResult sorted by overall score
    """
    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)
    
    results = []
    
    for model in models:
        try:
            import time
            start_time = time.time()
            
            # Get response from model
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=1000,  # Updated for GPT-5 models
            )
            
            latency_ms = int((time.time() - start_time) * 1000)
            response_text = response.choices[0].message.content
            
            # Calculate tokens and cost
            input_tokens = response.usage.prompt_tokens
            output_tokens = response.usage.completion_tokens
            cost = estimate_cost(input_tokens, output_tokens, model)
            
            # Run quick evaluation
            conversation = [
                ConversationMessage(role="user", content=prompt),
                ConversationMessage(role="assistant", content=response_text),
            ]
            
            coherence = await evaluate_coherence(conversation)
            factuality = await evaluate_factuality(conversation)
            safety = await evaluate_safety(conversation)
            helpfulness = await evaluate_helpfulness(conversation)
            
            results.append(ModelComparisonResult(
                model=model,
                latency_ms=latency_ms,
                cost_usd=cost,
                response=response_text[:500],  # Truncate for response
                coherence_score=coherence.score,
                factuality_score=factuality.score,
                safety_risk=safety.risk_score,
                helpfulness_score=helpfulness.score,
            ))
            
        except Exception as e:
            # Add failed result
            results.append(ModelComparisonResult(
                model=model,
                latency_ms=0,
                cost_usd=0,
                response=f"Error: {str(e)}",
                coherence_score=0,
                factuality_score=0,
                safety_risk=1,
                helpfulness_score=0,
            ))
    
    # Sort by weighted score (higher is better, lower safety risk is better)
    def score(r: ModelComparisonResult) -> float:
        return (
            r.coherence_score * 0.25 +
            r.factuality_score * 0.25 +
            (1 - r.safety_risk) * 0.25 +
            r.helpfulness_score * 0.25
        )
    
    results.sort(key=score, reverse=True)
    
    return results

