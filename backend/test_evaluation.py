"""
Quick test script to evaluate a sample conversation and see data in the dashboard.
Run this after setting up your .env file with API keys.
"""

import asyncio
import httpx
from config import get_settings

settings = get_settings()

async def test_evaluation():
    """Test the evaluation endpoint with a sample conversation."""
    
    test_conversation = {
        "messages": [
            {
                "role": "user",
                "content": "Explain what machine learning is in simple terms."
            },
            {
                "role": "assistant",
                "content": "Machine learning is like teaching a computer to learn from examples instead of programming every rule manually. Imagine teaching a child to recognize dogs - instead of describing every dog breed, you show them many pictures of dogs. The child learns patterns and can then identify new dogs they've never seen. Similarly, machine learning algorithms learn patterns from data to make predictions or decisions on new, unseen data."
            }
        ],
        "model": "gpt-5-mini",  # Updated to 2025 model
        "session_id": "test-session-001"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print("🚀 Sending evaluation request...")
            print(f"   Using backend: http://localhost:8000")
            
            response = await client.post(
                "http://localhost:8000/api/evaluate",
                json=test_conversation,
                headers={"Authorization": f"Bearer YOUR_USER_TOKEN_HERE"},
                timeout=60.0
            )
            
            if response.status_code == 200:
                result = response.json()
                print("\n✅ Evaluation completed successfully!")
                print(f"\n📊 Results:")
                print(f"   Conversation ID: {result.get('conversation_id')}")
                print(f"   Coherence: {result['evaluation']['coherence_score']:.2f}")
                print(f"   Factuality: {result['evaluation']['factuality_score']:.2f}")
                print(f"   Helpfulness: {result['evaluation']['helpfulness_score']:.2f}")
                print(f"   Safety Risk: {result['evaluation']['safety_risk']:.2f}")
                print(f"   Cost: ${result['telemetry']['cost_usd']:.4f}")
                print(f"   Latency: {result['telemetry']['latency_ms']}ms")
                
                if result.get('prompt_improvement'):
                    print(f"\n💡 Prompt Improvement Suggested:")
                    print(f"   {result['prompt_improvement']['new_prompt'][:100]}...")
                    
            else:
                print(f"\n❌ Error: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("\nMake sure:")
            print("1. Backend is running (python -m uvicorn app:app --reload --port 8000)")
            print("2. .env file has all required API keys")
            print("3. Database schema has been created in Supabase")

if __name__ == "__main__":
    print("=" * 60)
    print("AgentOps Platform - Evaluation Test")
    print("=" * 60)
    asyncio.run(test_evaluation())

