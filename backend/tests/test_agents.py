"""
Unit tests for evaluation agents.
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import json

from db.models import ConversationMessage, SafetyCategory


# Test conversation data
TEST_CONVERSATION = [
    ConversationMessage(role="user", content="What is the capital of France?"),
    ConversationMessage(role="assistant", content="The capital of France is Paris. It is known for the Eiffel Tower and is a major cultural center in Europe."),
]

UNSAFE_CONVERSATION = [
    ConversationMessage(role="user", content="How do I hack into someone's account?"),
    ConversationMessage(role="assistant", content="I cannot help with that request as it involves illegal activity."),
]


class TestCoherenceAgent:
    """Tests for the Coherence Evaluator Agent."""
    
    @pytest.mark.asyncio
    async def test_evaluate_coherence_returns_valid_result(self):
        """Test that coherence evaluation returns properly structured result."""
        with patch('agents.coherence_agent.OpenAI') as mock_openai:
            # Mock the OpenAI response
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = json.dumps({
                "score": 0.9,
                "explanation": "The response is clear and well-structured."
            })
            
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client
            
            from agents.coherence_agent import evaluate_coherence
            
            result = await evaluate_coherence(TEST_CONVERSATION)
            
            assert result.score >= 0 and result.score <= 1
            assert len(result.explanation) > 0
    
    @pytest.mark.asyncio
    async def test_evaluate_coherence_handles_error(self):
        """Test graceful error handling."""
        with patch('agents.coherence_agent.OpenAI') as mock_openai:
            mock_openai.return_value.chat.completions.create.side_effect = Exception("API Error")
            
            from agents.coherence_agent import evaluate_coherence
            
            result = await evaluate_coherence(TEST_CONVERSATION)
            
            # Should return default values on error
            assert result.score == 0.5
            assert "failed" in result.explanation.lower() or "error" in result.explanation.lower()


class TestSafetyAgent:
    """Tests for the Safety Agent."""
    
    @pytest.mark.asyncio
    async def test_evaluate_safety_returns_valid_result(self):
        """Test that safety evaluation returns properly structured result."""
        with patch('agents.safety_agent.OpenAI') as mock_openai:
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = json.dumps({
                "risk_score": 0.1,
                "category": "none",
                "explanation": "The response is safe.",
                "recommended_fix": None
            })
            
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client
            
            from agents.safety_agent import evaluate_safety
            
            result = await evaluate_safety(TEST_CONVERSATION)
            
            assert result.risk_score >= 0 and result.risk_score <= 1
            assert result.category in [c.value for c in SafetyCategory]
    
    @pytest.mark.asyncio
    async def test_evaluate_safety_detects_risk(self):
        """Test that safety agent properly flags unsafe content."""
        with patch('agents.safety_agent.OpenAI') as mock_openai:
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = json.dumps({
                "risk_score": 0.8,
                "category": "illegal",
                "explanation": "The request involves illegal activity.",
                "recommended_fix": "Decline to provide assistance."
            })
            
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client
            
            from agents.safety_agent import evaluate_safety
            
            result = await evaluate_safety(UNSAFE_CONVERSATION)
            
            assert result.risk_score > 0.5
            assert result.category != SafetyCategory.NONE


class TestHelpfulnessAgent:
    """Tests for the Helpfulness Agent."""
    
    @pytest.mark.asyncio
    async def test_evaluate_helpfulness_returns_valid_result(self):
        """Test that helpfulness evaluation returns all required fields."""
        with patch('agents.helpfulness_agent.OpenAI') as mock_openai:
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = json.dumps({
                "score": 0.85,
                "usefulness_score": 0.9,
                "tone_score": 0.8,
                "empathy_score": 0.75,
                "suggestions": ["Could add more detail."]
            })
            
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client
            
            from agents.helpfulness_agent import evaluate_helpfulness
            
            result = await evaluate_helpfulness(TEST_CONVERSATION)
            
            assert result.score >= 0 and result.score <= 1
            assert result.usefulness_score >= 0 and result.usefulness_score <= 1
            assert result.tone_score >= 0 and result.tone_score <= 1
            assert result.empathy_score >= 0 and result.empathy_score <= 1
            assert isinstance(result.suggestions, list)


class TestOptimizerAgent:
    """Tests for the Model Routing/Optimization Agent."""
    
    def test_count_tokens(self):
        """Test token counting functionality."""
        from agents.optimizer_agent import count_tokens
        
        text = "Hello, world!"
        tokens = count_tokens(text)
        
        assert tokens > 0
        assert isinstance(tokens, int)
    
    def test_estimate_cost(self):
        """Test cost estimation."""
        from agents.optimizer_agent import estimate_cost
        
        cost = estimate_cost(1000, 500, "gpt-4o-mini")
        
        assert cost > 0
        assert isinstance(cost, float)
    
    def test_estimate_latency(self):
        """Test latency estimation."""
        from agents.optimizer_agent import estimate_latency
        
        latency = estimate_latency(1000, 500, "gpt-4o-mini")
        
        assert latency > 0
        assert isinstance(latency, int)
    
    @pytest.mark.asyncio
    async def test_recommend_model_returns_valid_result(self):
        """Test model recommendation returns required fields."""
        with patch('agents.optimizer_agent.OpenAI') as mock_openai:
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = json.dumps({
                "recommended_model": "gpt-4o-mini",
                "reasoning": "Simple task, cost-effective option.",
                "complexity_score": 0.3,
                "quality_requirement": 0.5
            })
            
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client
            
            from agents.optimizer_agent import recommend_model
            
            result = await recommend_model(TEST_CONVERSATION)
            
            assert result.recommended_model in ["gpt-4o", "gpt-4o-mini"]
            assert result.cost_estimate >= 0
            assert result.latency_prediction > 0
            assert len(result.reasoning) > 0


class TestSOPAgent:
    """Tests for the SOP Compliance Agent."""
    
    def test_load_sop_rules(self):
        """Test SOP rules loading."""
        from agents.sop_agent import load_sop_rules
        
        rules = load_sop_rules()
        
        assert "rules" in rules
        assert isinstance(rules["rules"], list)
    
    @pytest.mark.asyncio
    async def test_evaluate_sop_compliance_returns_valid_result(self):
        """Test SOP compliance evaluation returns properly structured result."""
        with patch('agents.sop_agent.OpenAI') as mock_openai:
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = json.dumps({
                "compliant": True,
                "violations": []
            })
            
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client
            
            from agents.sop_agent import evaluate_sop_compliance
            
            result = await evaluate_sop_compliance(TEST_CONVERSATION)
            
            assert isinstance(result.compliant, bool)
            assert isinstance(result.violations, list)
            assert isinstance(result.severity_summary, dict)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

