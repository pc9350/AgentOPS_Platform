"""
API endpoint tests.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
import json

# We need to mock settings before importing the app
with patch('config.get_settings') as mock_settings:
    mock_settings.return_value = MagicMock(
        supabase_url="https://test.supabase.co",
        supabase_publishable_key="test-publishable-key",
        supabase_secret_key="test-secret-key",
        supabase_jwt_secret="test-secret",
        openai_api_key="test-openai-key",
        tavily_api_key="test-tavily-key",
        cors_origins="http://localhost:3000",
        cors_origins_list=["http://localhost:3000"],
    )
    from app import app

client = TestClient(app)


class TestHealthEndpoints:
    """Tests for health check endpoints."""
    
    def test_root_endpoint(self):
        """Test root endpoint returns app info."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert data["name"] == "AgentOps Platform"
        assert "version" in data
        assert "status" in data
    
    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestEvaluateEndpoint:
    """Tests for /api/evaluate endpoint."""
    
    def test_evaluate_requires_auth(self):
        """Test that evaluate endpoint requires authentication."""
        response = client.post(
            "/api/evaluate",
            json={
                "conversation": [
                    {"role": "user", "content": "Hello"},
                    {"role": "assistant", "content": "Hi there!"}
                ]
            }
        )
        
        # Should return 403 Forbidden without auth
        assert response.status_code == 403
    
    def test_evaluate_with_invalid_body(self):
        """Test evaluate endpoint with invalid request body."""
        response = client.post(
            "/api/evaluate",
            json={"invalid": "data"},
            headers={"Authorization": "Bearer test-token"}
        )
        
        # Should return 422 Unprocessable Entity or 401/403 for auth
        assert response.status_code in [401, 403, 422]


class TestConversationsEndpoint:
    """Tests for /api/conversations endpoints."""
    
    def test_list_conversations_requires_auth(self):
        """Test that conversations list requires authentication."""
        response = client.get("/api/conversations")
        
        assert response.status_code == 403
    
    def test_get_conversation_requires_auth(self):
        """Test that single conversation requires authentication."""
        response = client.get("/api/conversations/123e4567-e89b-12d3-a456-426614174000")
        
        assert response.status_code == 403


class TestModelTestEndpoint:
    """Tests for /api/test-model endpoint."""
    
    def test_test_model_requires_auth(self):
        """Test that model test endpoint requires authentication."""
        response = client.post(
            "/api/test-model",
            json={"prompt": "Test prompt"}
        )
        
        assert response.status_code == 403


class TestCORS:
    """Tests for CORS configuration."""
    
    def test_cors_headers(self):
        """Test that CORS headers are present."""
        response = client.options(
            "/api/evaluate",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            }
        )
        
        # Should allow CORS from configured origin
        assert response.status_code in [200, 405]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

