"""
Conversations API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from uuid import UUID

from db.models import (
    ConversationListResponse,
    ConversationDetailResponse,
    PaginationParams,
)
from db.supabase_client import get_supabase_client
from middleware.supabase_auth import get_current_user, UserInfo


router = APIRouter()


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    model: Optional[str] = Query(None, description="Filter by model"),
    min_safety_risk: Optional[float] = Query(None, ge=0, le=1, description="Min safety risk"),
    user: UserInfo = Depends(get_current_user),
):
    """
    Get paginated list of conversations with optional filters.
    """
    supabase = get_supabase_client()
    
    try:
        # Calculate offset
        offset = (page - 1) * page_size
        
        # Build query
        query = supabase.table("conversations").select(
            "*, evaluations(*)",
            count="exact"
        ).eq("user_id", user.user_id)
        
        # Apply filters
        if model:
            query = query.eq("model", model)
        
        # Order and paginate
        query = query.order("created_at", desc=True).range(offset, offset + page_size - 1)
        
        result = query.execute()
        
        # Filter by safety risk if specified (post-query filter)
        conversations = result.data
        if min_safety_risk is not None:
            conversations = [
                c for c in conversations
                if c.get("evaluations") and 
                len(c["evaluations"]) > 0 and
                c["evaluations"][0].get("safety_risk", 0) >= min_safety_risk
            ]
        
        return ConversationListResponse(
            conversations=conversations,
            total=result.count or len(conversations),
            page=page,
            page_size=page_size,
            total_pages=(result.count or 0) // page_size + 1,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: UUID,
    user: UserInfo = Depends(get_current_user),
):
    """
    Get full evaluation trace for a specific conversation.
    """
    supabase = get_supabase_client()
    
    try:
        # Get conversation with all related data
        result = supabase.table("conversations").select(
            "*, evaluations(*), prompt_improvements(*)"
        ).eq("id", str(conversation_id)).eq("user_id", user.user_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return ConversationDetailResponse(**result.data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/stats/overview")
async def get_conversation_stats(
    user: UserInfo = Depends(get_current_user),
):
    """
    Get overview statistics for the dashboard.
    """
    supabase = get_supabase_client()
    
    try:
        # Get total conversations
        conversations = supabase.table("conversations").select(
            "id, model, latency_ms, cost_usd, created_at"
        ).eq("user_id", user.user_id).execute()
        
        # Get evaluations for averages
        evaluations = supabase.table("evaluations").select(
            "coherence_score, factuality_score, helpfulness_score, safety_risk"
        ).execute()
        
        total_conversations = len(conversations.data)
        total_cost = sum(c.get("cost_usd", 0) or 0 for c in conversations.data)
        avg_latency = (
            sum(c.get("latency_ms", 0) or 0 for c in conversations.data) / total_conversations
            if total_conversations > 0 else 0
        )
        
        # Model distribution
        model_counts = {}
        for c in conversations.data:
            model = c.get("model", "unknown")
            model_counts[model] = model_counts.get(model, 0) + 1
        
        # Average scores
        avg_coherence = (
            sum(e.get("coherence_score", 0) or 0 for e in evaluations.data) / len(evaluations.data)
            if evaluations.data else 0
        )
        avg_factuality = (
            sum(e.get("factuality_score", 0) or 0 for e in evaluations.data) / len(evaluations.data)
            if evaluations.data else 0
        )
        avg_helpfulness = (
            sum(e.get("helpfulness_score", 0) or 0 for e in evaluations.data) / len(evaluations.data)
            if evaluations.data else 0
        )
        avg_safety_risk = (
            sum(e.get("safety_risk", 0) or 0 for e in evaluations.data) / len(evaluations.data)
            if evaluations.data else 0
        )
        
        return {
            "total_conversations": total_conversations,
            "total_cost_usd": round(total_cost, 4),
            "avg_latency_ms": round(avg_latency, 2),
            "model_distribution": model_counts,
            "avg_scores": {
                "coherence": round(avg_coherence, 3),
                "factuality": round(avg_factuality, 3),
                "helpfulness": round(avg_helpfulness, 3),
                "safety_risk": round(avg_safety_risk, 3),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/stats/telemetry")
async def get_telemetry_stats(
    days: int = Query(7, ge=1, le=90, description="Number of days to analyze"),
    user: UserInfo = Depends(get_current_user),
):
    """
    Get telemetry metrics for visualization (token usage, costs, latency over time).
    """
    supabase = get_supabase_client()
    
    try:
        from datetime import datetime, timedelta
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get conversations in date range
        conversations = supabase.table("conversations").select(
            "id, model, input_tokens, output_tokens, latency_ms, cost_usd, created_at"
        ).eq("user_id", user.user_id).gte(
            "created_at", start_date.isoformat()
        ).order("created_at", desc=False).execute()
        
        # Group by date
        daily_stats = {}
        model_costs = {}
        latency_buckets = {"0-500ms": 0, "500-1000ms": 0, "1000-2000ms": 0, "2000ms+": 0}
        
        for c in conversations.data:
            # Extract date (YYYY-MM-DD)
            date_str = c["created_at"][:10]
            
            if date_str not in daily_stats:
                daily_stats[date_str] = {
                    "date": date_str,
                    "input_tokens": 0,
                    "output_tokens": 0,
                    "cost_usd": 0,
                    "count": 0,
                }
            
            daily_stats[date_str]["input_tokens"] += c.get("input_tokens", 0) or 0
            daily_stats[date_str]["output_tokens"] += c.get("output_tokens", 0) or 0
            daily_stats[date_str]["cost_usd"] += c.get("cost_usd", 0) or 0
            daily_stats[date_str]["count"] += 1
            
            # Model cost breakdown
            model = c.get("model", "unknown")
            model_costs[model] = model_costs.get(model, 0) + (c.get("cost_usd", 0) or 0)
            
            # Latency buckets
            latency = c.get("latency_ms", 0) or 0
            if latency < 500:
                latency_buckets["0-500ms"] += 1
            elif latency < 1000:
                latency_buckets["500-1000ms"] += 1
            elif latency < 2000:
                latency_buckets["1000-2000ms"] += 1
            else:
                latency_buckets["2000ms+"] += 1
        
        # Convert to sorted list
        timeline = sorted(daily_stats.values(), key=lambda x: x["date"])
        
        return {
            "timeline": timeline,
            "model_costs": model_costs,
            "latency_distribution": latency_buckets,
            "total_input_tokens": sum(c.get("input_tokens", 0) or 0 for c in conversations.data),
            "total_output_tokens": sum(c.get("output_tokens", 0) or 0 for c in conversations.data),
            "total_cost": sum(c.get("cost_usd", 0) or 0 for c in conversations.data),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/stats/safety-heatmap")
async def get_safety_heatmap(
    user: UserInfo = Depends(get_current_user),
):
    """
    Get safety risk distribution by category.
    """
    supabase = get_supabase_client()
    
    try:
        # Get all evaluations with safety data
        conversations = supabase.table("conversations").select(
            "id"
        ).eq("user_id", user.user_id).execute()
        
        conversation_ids = [c["id"] for c in conversations.data]
        
        if not conversation_ids:
            return {"categories": {}}
        
        evaluations = supabase.table("evaluations").select(
            "safety_risk, evaluator_details"
        ).in_("conversation_id", conversation_ids).execute()
        
        # Early return if no evaluations
        if not evaluations.data:
            return {"categories": {}}
        
        # Count by category (extract from evaluator_details JSON)
        category_counts = {}
        for e in evaluations.data:
            # Extract category from evaluator_details.safety.category
            evaluator_details = e.get("evaluator_details", {})
            safety_details = evaluator_details.get("safety", {})
            category = safety_details.get("category", "none")
            risk = e.get("safety_risk", 0) or 0
            
            if category not in category_counts:
                category_counts[category] = {"count": 0, "total_risk": 0}
            
            category_counts[category]["count"] += 1
            category_counts[category]["total_risk"] += risk
        
        # Calculate average risk per category
        for category in category_counts:
            if category_counts[category]["count"] > 0:
                category_counts[category]["avg_risk"] = (
                    category_counts[category]["total_risk"] / category_counts[category]["count"]
                )
            else:
                category_counts[category]["avg_risk"] = 0
        
        return {"categories": category_counts}
    except Exception as e:
        import traceback
        print(f"Safety heatmap error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/prompt-improvements")
async def get_prompt_improvements(
    user: UserInfo = Depends(get_current_user),
):
    """
    Get conversations with prompt improvements.
    """
    supabase = get_supabase_client()
    
    # Hardcode for now to test
    page = 1
    page_size = 20
    
    # print(f"[Prompt Improvements] Function started! Fetching for user: {user.user_id}, page: {page}, page_size: {page_size}")
    
    try:
        # Calculate offset
        offset = (page - 1) * page_size
        
        # Get conversations that have prompt improvements
        conversations = supabase.table("conversations").select(
            "id, user_input, created_at, model"
        ).eq("user_id", user.user_id).order("created_at", desc=True).execute()
        
        # Early return if no conversations
        if not conversations.data:
            return {
                "improvements": [],
                "total": 0,
                "page": page,
                "page_size": page_size,
                "total_pages": 0,
            }
        
        # Get prompt improvements
        improvements = supabase.table("prompt_improvements").select(
            "conversation_id, new_prompt, reasoning, created_at"
        ).in_(
            "conversation_id", [c["id"] for c in conversations.data]
        ).execute()
        
        # Create lookup map
        improvements_map = {imp["conversation_id"]: imp for imp in improvements.data}
        
        # Filter conversations that have improvements
        results = []
        for c in conversations.data:
            if c["id"] in improvements_map:
                improvement = improvements_map[c["id"]]
                
                results.append({
                    "id": c["id"],
                    "created_at": c["created_at"],
                    "model": c["model"],
                    "original_prompt": c.get("user_input", ""),
                    "improved_prompt": improvement["new_prompt"],
                    "reasoning": improvement["reasoning"],
                    "changes_made": [],  # Not stored in database
                })
        
        # Paginate
        total = len(results)
        paginated_results = results[offset:offset + page_size]
        
        # print(f"[Prompt Improvements] Found {total} improvements")
        
        return {
            "improvements": paginated_results,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total // page_size) + (1 if total % page_size > 0 else 0),
        }
    except Exception as e:
        import traceback
        print(f"[Prompt Improvements] Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

