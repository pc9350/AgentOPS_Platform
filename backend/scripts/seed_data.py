"""
Seed sample data for testing and development.

Usage:
    python -m scripts.seed_data

This will create sample conversations, evaluations, and prompt improvements
in your Supabase database for testing the dashboard.
"""
import asyncio
import random
from datetime import datetime, timedelta
from uuid import uuid4

from db.supabase_client import get_supabase_client


# Sample prompts and responses
SAMPLE_CONVERSATIONS = [
    {
        "user_input": "What is machine learning and how does it work?",
        "model_output": "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It works by training algorithms on large datasets to identify patterns and make decisions. The main types include supervised learning (labeled data), unsupervised learning (unlabeled data), and reinforcement learning (reward-based).",
        "model": "gpt-5-mini",  # Updated to 2025 model
    },
    {
        "user_input": "Write a Python function to calculate fibonacci numbers",
        "model_output": """Here's an efficient Python function to calculate Fibonacci numbers:

```python
def fibonacci(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b
```

This uses iteration for O(n) time complexity and O(1) space.""",
        "model": "gpt-5-mini",  # Updated to 2025 model
    },
    {
        "user_input": "Explain quantum computing to a beginner",
        "model_output": "Quantum computing uses quantum mechanics principles to process information. Unlike classical computers using bits (0 or 1), quantum computers use qubits that can be in superposition - both 0 and 1 simultaneously. This allows them to solve certain problems exponentially faster. Key concepts include superposition, entanglement, and quantum interference. Applications include cryptography, drug discovery, and optimization problems.",
        "model": "gpt-4o",
    },
    {
        "user_input": "What are the health benefits of green tea?",
        "model_output": "Green tea offers several health benefits backed by research. It contains antioxidants (catechins) that may reduce cell damage. Studies suggest it can improve brain function, boost metabolism, and lower risk of certain cancers. The L-theanine amino acid promotes relaxation without drowsiness. However, consult a healthcare provider as it can interact with medications.",
        "model": "gpt-5-mini",  # Updated to 2025 model
    },
    {
        "user_input": "How do I start investing in stocks?",
        "model_output": "Here are steps to start investing in stocks: 1) Learn the basics of stock markets and investment strategies. 2) Set clear financial goals and determine your risk tolerance. 3) Open a brokerage account with a reputable platform. 4) Start with index funds or ETFs for diversification. 5) Research individual stocks if you want direct ownership. Important: I recommend consulting a licensed financial advisor for personalized advice. Past performance doesn't guarantee future results.",
        "model": "gpt-4o",
    },
]


def generate_evaluation_scores():
    """Generate realistic evaluation scores."""
    base_coherence = random.uniform(0.75, 0.98)
    base_factuality = random.uniform(0.70, 0.95)
    base_helpfulness = random.uniform(0.72, 0.95)
    base_safety_risk = random.uniform(0.01, 0.25)
    
    return {
        "coherence_score": round(base_coherence, 3),
        "factuality_score": round(base_factuality, 3),
        "helpfulness_score": round(base_helpfulness, 3),
        "safety_risk": round(base_safety_risk, 3),
        "sop_violations": [],
        "evaluator_details": {
            "coherence": {
                "score": round(base_coherence, 3),
                "explanation": "Response is well-structured and easy to understand.",
            },
            "factuality": {
                "score": round(base_factuality, 3),
                "hallucination_likelihood": round(1 - base_factuality, 3),
                "corrected_facts": [],
                "sources_checked": ["General knowledge"],
            },
            "safety": {
                "risk_score": round(base_safety_risk, 3),
                "category": "none",
                "explanation": "No safety concerns detected.",
                "recommended_fix": None,
            },
            "helpfulness": {
                "score": round(base_helpfulness, 3),
                "usefulness_score": round(random.uniform(0.75, 0.95), 3),
                "tone_score": round(random.uniform(0.80, 0.95), 3),
                "empathy_score": round(random.uniform(0.70, 0.90), 3),
                "suggestions": [],
            },
        },
    }


async def seed_database(user_id: str = "seed-user-001", num_conversations: int = 50):
    """
    Seed the database with sample data.
    
    Args:
        user_id: User ID to associate with seeded data
        num_conversations: Number of conversations to create
    """
    supabase = get_supabase_client()
    
    print(f"🌱 Seeding database with {num_conversations} conversations...")
    
    conversations_created = 0
    evaluations_created = 0
    improvements_created = 0
    
    for i in range(num_conversations):
        # Pick a random sample conversation
        sample = random.choice(SAMPLE_CONVERSATIONS)
        
        # Generate timestamps going back up to 30 days
        days_ago = random.randint(0, 30)
        hours_ago = random.randint(0, 23)
        created_at = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
        
        # Generate telemetry
        input_tokens = random.randint(20, 150)
        output_tokens = random.randint(100, 500)
        latency_ms = random.randint(200, 1200)
        
        # Calculate cost based on model
        if sample["model"] == "gpt-4o":
            cost = (input_tokens * 0.005 + output_tokens * 0.015) / 1000
        else:
            cost = (input_tokens * 0.00015 + output_tokens * 0.0006) / 1000
        
        # Create conversation
        conversation_data = {
            "id": str(uuid4()),
            "user_id": user_id,
            "session_id": f"session-{i // 5}",
            "user_input": sample["user_input"],
            "model_output": sample["model_output"],
            "model": sample["model"],
            "latency_ms": latency_ms,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": round(cost, 6),
            "created_at": created_at.isoformat(),
        }
        
        try:
            result = supabase.table("conversations").insert(conversation_data).execute()
            conversations_created += 1
            conversation_id = result.data[0]["id"]
            
            # Create evaluation
            eval_scores = generate_evaluation_scores()
            evaluation_data = {
                "id": str(uuid4()),
                "conversation_id": conversation_id,
                **eval_scores,
                "created_at": created_at.isoformat(),
            }
            
            supabase.table("evaluations").insert(evaluation_data).execute()
            evaluations_created += 1
            
            # Create prompt improvement for ~30% of conversations
            if random.random() < 0.3:
                improvement_data = {
                    "id": str(uuid4()),
                    "conversation_id": conversation_id,
                    "new_prompt": f"[Improved] {sample['user_input']} Please provide a detailed explanation with examples.",
                    "reasoning": "Added specificity to get more comprehensive responses.",
                    "created_at": created_at.isoformat(),
                }
                
                supabase.table("prompt_improvements").insert(improvement_data).execute()
                improvements_created += 1
            
            if (i + 1) % 10 == 0:
                print(f"  Created {i + 1}/{num_conversations} conversations...")
                
        except Exception as e:
            print(f"  Error creating conversation {i}: {e}")
    
    print(f"\n✅ Seeding complete!")
    print(f"   - Conversations: {conversations_created}")
    print(f"   - Evaluations: {evaluations_created}")
    print(f"   - Prompt Improvements: {improvements_created}")


async def clear_seed_data(user_id: str = "seed-user-001"):
    """Remove seeded data for a specific user."""
    supabase = get_supabase_client()
    
    print(f"🗑️ Clearing seed data for user {user_id}...")
    
    try:
        # Get conversation IDs first
        result = supabase.table("conversations").select("id").eq("user_id", user_id).execute()
        conversation_ids = [r["id"] for r in result.data]
        
        if conversation_ids:
            # Delete related evaluations and improvements (cascade should handle this)
            supabase.table("conversations").delete().eq("user_id", user_id).execute()
            print(f"   Deleted {len(conversation_ids)} conversations and related data")
        else:
            print("   No seed data found")
            
    except Exception as e:
        print(f"   Error clearing data: {e}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "clear":
        asyncio.run(clear_seed_data())
    else:
        asyncio.run(seed_database())

