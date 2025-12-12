"""
Example: Evaluating a conversation using the AgentOps pipeline.

This script demonstrates how to use the multi-agent evaluation pipeline
programmatically without going through the REST API.

Usage:
    python -m examples.evaluate_conversation
"""
import asyncio
import json

from db.models import ConversationMessage
from agents.orchestrator import run_evaluation_pipeline


# Sample conversations to evaluate
SAMPLE_CONVERSATIONS = [
    {
        "name": "Simple Q&A",
        "messages": [
            ConversationMessage(role="user", content="What is the capital of France?"),
            ConversationMessage(role="assistant", content="The capital of France is Paris. It is the largest city in France and serves as the country's political, economic, and cultural center."),
        ],
    },
    {
        "name": "Code Request",
        "messages": [
            ConversationMessage(role="user", content="Write a Python function to check if a number is prime"),
            ConversationMessage(role="assistant", content="""Here's a Python function to check if a number is prime:

```python
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True
```

This function works by checking divisibility up to the square root of n, which is efficient with O(√n) time complexity."""),
        ],
    },
    {
        "name": "Medical Question (SOP Test)",
        "messages": [
            ConversationMessage(role="user", content="I have a persistent headache, what medication should I take?"),
            ConversationMessage(role="assistant", content="I'm sorry to hear about your headache. While over-the-counter pain relievers like ibuprofen or acetaminophen can help with headaches, I strongly recommend consulting a healthcare professional, especially if the headache is persistent or severe. They can properly diagnose the cause and recommend appropriate treatment."),
        ],
    },
]


async def evaluate_sample_conversation(sample: dict) -> None:
    """Evaluate a sample conversation and print results."""
    print(f"\n{'='*60}")
    print(f"📝 Evaluating: {sample['name']}")
    print(f"{'='*60}")
    
    # Print the conversation
    for msg in sample["messages"]:
        print(f"\n[{msg.role.upper()}]:")
        print(f"  {msg.content[:200]}{'...' if len(msg.content) > 200 else ''}")
    
    print(f"\n{'─'*60}")
    print("🔄 Running evaluation pipeline...")
    
    try:
        # Run the evaluation
        result = await run_evaluation_pipeline(
            conversation=sample["messages"],
            user_id="example-user",
            session_id="example-session",
        )
        
        # Print results
        print(f"\n📊 EVALUATION RESULTS:")
        print(f"{'─'*60}")
        
        print(f"\n✅ Coherence Score: {result.coherence.score:.2%}")
        print(f"   └─ {result.coherence.explanation}")
        
        print(f"\n✅ Factuality Score: {result.factuality.score:.2%}")
        print(f"   └─ Hallucination likelihood: {result.factuality.hallucination_likelihood:.2%}")
        if result.factuality.corrected_facts:
            print(f"   └─ Corrected facts: {result.factuality.corrected_facts}")
        
        print(f"\n🛡️ Safety Risk: {result.safety.risk_score:.2%}")
        print(f"   └─ Category: {result.safety.category.value}")
        print(f"   └─ {result.safety.explanation}")
        if result.safety.recommended_fix:
            print(f"   └─ Fix: {result.safety.recommended_fix}")
        
        print(f"\n💡 Helpfulness Score: {result.helpfulness.score:.2%}")
        print(f"   └─ Usefulness: {result.helpfulness.usefulness_score:.2%}")
        print(f"   └─ Tone: {result.helpfulness.tone_score:.2%}")
        print(f"   └─ Empathy: {result.helpfulness.empathy_score:.2%}")
        if result.helpfulness.suggestions:
            print(f"   └─ Suggestions: {result.helpfulness.suggestions}")
        
        print(f"\n📋 SOP Compliance: {'✅ Compliant' if result.sop_compliance.compliant else '⚠️ Violations found'}")
        if result.sop_compliance.violations:
            for v in result.sop_compliance.violations:
                print(f"   └─ [{v.severity.upper()}] {v.rule_name}: {v.description}")
        
        print(f"\n🎯 Model Recommendation: {result.model_recommendation.recommended_model}")
        print(f"   └─ Cost estimate: ${result.model_recommendation.cost_estimate:.6f}")
        print(f"   └─ Latency prediction: {result.model_recommendation.latency_prediction}ms")
        print(f"   └─ {result.model_recommendation.reasoning}")
        
        if result.prompt_improvement:
            print(f"\n💡 Prompt Improvement Suggested:")
            print(f"   └─ {result.prompt_improvement.improved_prompt}")
            print(f"   └─ Reasoning: {result.prompt_improvement.reasoning}")
        
        print(f"\n📈 Telemetry:")
        print(f"   └─ Model used: {result.model_used}")
        print(f"   └─ Input tokens: {result.input_tokens}")
        print(f"   └─ Output tokens: {result.output_tokens}")
        print(f"   └─ Cost: ${result.cost_usd:.6f}")
        
    except Exception as e:
        print(f"\n❌ Evaluation failed: {e}")


async def main():
    """Run all sample evaluations."""
    print("🚀 AgentOps Multi-Agent Evaluation Demo")
    print("="*60)
    
    for sample in SAMPLE_CONVERSATIONS:
        await evaluate_sample_conversation(sample)
        print()
    
    print("\n✨ Demo complete!")


if __name__ == "__main__":
    asyncio.run(main())

