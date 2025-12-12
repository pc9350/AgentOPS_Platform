"""
Pydantic models for database tables and API requests/responses.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


# ============== Conversation Models ==============

class ConversationMessage(BaseModel):
    """A single message in a conversation."""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ConversationCreate(BaseModel):
    """Model for creating a conversation record."""
    user_id: str
    session_id: Optional[str] = None
    user_input: str
    model_output: str
    model: str
    latency_ms: int
    input_tokens: int
    output_tokens: int
    cost_usd: float


class ConversationRecord(BaseModel):
    """Full conversation record from database."""
    id: UUID
    user_id: str
    session_id: Optional[str] = None
    user_input: str
    model_output: str
    model: str
    latency_ms: int
    input_tokens: int
    output_tokens: int
    cost_usd: float
    created_at: datetime


# ============== Evaluation Models ==============

class CoherenceResult(BaseModel):
    """Result from the Coherence Evaluator Agent."""
    score: float = Field(..., ge=0, le=1, description="Coherence score 0-1")
    explanation: str = Field(..., description="Explanation of the score")


class FactualityResult(BaseModel):
    """Result from the Factuality Agent."""
    score: float = Field(..., ge=0, le=1, description="Factuality score 0-1")
    hallucination_likelihood: float = Field(..., ge=0, le=1, description="Likelihood of hallucination")
    corrected_facts: List[str] = Field(default_factory=list, description="List of corrected facts")
    sources_checked: List[str] = Field(default_factory=list, description="Sources used for verification")


class SafetyCategory(str, Enum):
    """Categories of safety risks."""
    TOXICITY = "toxicity"
    BIAS = "bias"
    ILLEGAL = "illegal"
    HARMFUL_ADVICE = "harmful_advice"
    NONE = "none"


class SafetyResult(BaseModel):
    """Result from the Safety Agent."""
    risk_score: float = Field(..., ge=0, le=1, description="Safety risk score 0-1")
    category: SafetyCategory = Field(..., description="Category of risk detected")
    explanation: str = Field(..., description="Explanation of safety assessment")
    recommended_fix: Optional[str] = Field(None, description="Suggested fix if risk detected")


class HelpfulnessResult(BaseModel):
    """Result from the Helpfulness Agent."""
    score: float = Field(..., ge=0, le=1, description="Helpfulness score 0-1")
    usefulness_score: float = Field(..., ge=0, le=1, description="How useful the response is")
    tone_score: float = Field(..., ge=0, le=1, description="Appropriateness of tone")
    empathy_score: float = Field(..., ge=0, le=1, description="Level of empathy shown")
    suggestions: List[str] = Field(default_factory=list, description="Improvement suggestions")


class SOPViolation(BaseModel):
    """A single SOP violation."""
    rule_id: str = Field(..., description="ID of the violated rule")
    rule_name: str = Field(..., description="Name of the violated rule")
    severity: str = Field(..., description="Severity: low, medium, high, critical")
    description: str = Field(..., description="Description of the violation")


class SOPComplianceResult(BaseModel):
    """Result from the SOP Compliance Agent."""
    compliant: bool = Field(..., description="Whether response is fully compliant")
    violations: List[SOPViolation] = Field(default_factory=list, description="List of violations")
    severity_summary: Dict[str, int] = Field(default_factory=dict, description="Count by severity")


class ModelRecommendation(BaseModel):
    """Result from the Model Routing/Optimization Agent."""
    recommended_model: str = Field(..., description="Recommended model ID")
    cost_estimate: float = Field(..., description="Estimated cost in USD")
    latency_prediction: int = Field(..., description="Predicted latency in ms")
    reasoning: str = Field(..., description="Reasoning for recommendation")
    alternatives: List[Dict[str, Any]] = Field(default_factory=list, description="Alternative options")


class PromptImprovement(BaseModel):
    """Result from the Prompt Improvement Agent."""
    improved_prompt: str = Field(..., description="The improved prompt")
    reasoning: str = Field(..., description="Why improvements were made")
    changes_made: List[str] = Field(default_factory=list, description="List of changes")


# ============== API Request/Response Models ==============

class EvaluationRequest(BaseModel):
    """Request body for /api/evaluate endpoint."""
    conversation: List[ConversationMessage] = Field(..., description="The conversation to evaluate")
    model: str = Field(default="gpt-5-nano", description="The model that generated this conversation")
    session_id: Optional[str] = Field(None, description="Optional session ID for tracking")


class EvaluationResult(BaseModel):
    """Internal result from evaluation pipeline."""
    coherence: CoherenceResult
    factuality: FactualityResult
    safety: SafetyResult
    helpfulness: HelpfulnessResult
    sop_compliance: SOPComplianceResult
    model_recommendation: ModelRecommendation
    prompt_improvement: Optional[PromptImprovement] = None
    model_used: str
    input_tokens: int
    output_tokens: int
    cost_usd: float


class EvaluationResponse(BaseModel):
    """Response body for /api/evaluate endpoint."""
    conversation_id: UUID
    coherence: CoherenceResult
    factuality: FactualityResult
    safety: SafetyResult
    helpfulness: HelpfulnessResult
    sop_compliance: SOPComplianceResult
    model_recommendation: ModelRecommendation
    prompt_improvement: Optional[PromptImprovement] = None
    telemetry: Dict[str, Any]


class ModelTestRequest(BaseModel):
    """Request body for /api/test-model endpoint."""
    prompt: str = Field(..., description="Prompt to test across models")
    models: Optional[List[str]] = Field(None, description="Models to test (default: all)")


class ModelComparisonResult(BaseModel):
    """Comparison result for a single model."""
    model: str
    latency_ms: int
    cost_usd: float
    response: str
    coherence_score: float
    factuality_score: float
    safety_risk: float
    helpfulness_score: float


class ModelTestResponse(BaseModel):
    """Response body for /api/test-model endpoint."""
    results: List[ModelComparisonResult]
    recommendation: Optional[ModelComparisonResult] = None


class PaginationParams(BaseModel):
    """Pagination parameters."""
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


class ConversationListItem(BaseModel):
    """Conversation item for list view."""
    id: UUID
    model: str
    latency_ms: int
    cost_usd: float
    created_at: datetime
    evaluations: Optional[List[Dict[str, Any]]] = None


class ConversationListResponse(BaseModel):
    """Response for conversation list endpoint."""
    conversations: List[Dict[str, Any]]
    total: int
    page: int
    page_size: int
    total_pages: int


class ConversationDetailResponse(BaseModel):
    """Full conversation detail with evaluations."""
    id: UUID
    user_id: str
    session_id: Optional[str] = None
    user_input: str
    model_output: str
    model: str
    latency_ms: int
    input_tokens: int
    output_tokens: int
    cost_usd: float
    created_at: datetime
    evaluations: List[Dict[str, Any]] = Field(default_factory=list)
    prompt_improvements: List[Dict[str, Any]] = Field(default_factory=list)

