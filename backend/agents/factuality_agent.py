"""
Factuality Agent
Verifies claims using web search and detects hallucinations.
"""
from typing import List
from openai import OpenAI
from tavily import TavilyClient
import json

from config import get_settings
from db.models import FactualityResult, ConversationMessage


FACTUALITY_SYSTEM_PROMPT = """You are an expert fact-checker evaluating AI responses for accuracy.

You will receive:
1. A conversation between a user and an AI assistant
2. Search results from the web related to claims in the response

Your task:
1. Identify factual claims made in the assistant's response
2. Verify each claim against the search results
3. Calculate the likelihood of hallucination
4. List any corrections needed

Provide your evaluation as JSON with:
- score: Factuality score 0-1 (1 = all facts verified)
- hallucination_likelihood: 0-1 (0 = no hallucination detected)
- corrected_facts: Array of corrections if any facts were wrong
- claims_verified: Number of claims that could be verified

Example output:
{
    "score": 0.9,
    "hallucination_likelihood": 0.1,
    "corrected_facts": ["The actual population is 8.4 million, not 9 million"],
    "claims_verified": 5
}"""


async def evaluate_factuality(
    conversation: List[ConversationMessage],
) -> FactualityResult:
    """
    Evaluate the factuality of a conversation response.
    Uses Tavily search to verify claims.
    
    Args:
        conversation: List of conversation messages
        
    Returns:
        FactualityResult with score, hallucination likelihood, and corrections
    """
    settings = get_settings()
    openai_client = OpenAI(api_key=settings.openai_api_key)
    tavily_client = TavilyClient(api_key=settings.tavily_api_key)
    
    # Get the assistant's response
    assistant_messages = [msg for msg in conversation if msg.role == "assistant"]
    if not assistant_messages:
        return FactualityResult(
            score=1.0,
            hallucination_likelihood=0.0,
            corrected_facts=[],
            sources_checked=[],
        )
    
    response_text = assistant_messages[-1].content
    
    # Extract key claims to search for
    try:
        extraction_response = openai_client.chat.completions.create(
            model="gpt-5.1",  # Higher accuracy for factuality - critical!
            messages=[
                {
                    "role": "system",
                    "content": "Extract 3-5 key factual claims from the text that can be verified. Return as JSON: {\"claims\": [\"claim1\", \"claim2\"]}"
                },
                {"role": "user", "content": response_text},
            ],
            response_format={"type": "json_object"},
            max_completion_tokens=300,  # GPT-5 models - no custom temperature allowed
        )
        
        claims_data = json.loads(extraction_response.choices[0].message.content)
        claims = claims_data.get("claims", [])[:5]  # Limit to 5 claims
    except Exception:
        claims = []
    
    # Search for verification of each claim
    search_results = []
    sources_checked = []
    
    for claim in claims:
        try:
            result = tavily_client.search(
                query=claim,
                search_depth="basic",
                max_results=3,
            )
            search_results.append({
                "claim": claim,
                "results": result.get("results", []),
            })
            sources_checked.extend([r.get("url", "") for r in result.get("results", [])])
        except Exception:
            continue
    
    # Evaluate factuality with search results
    try:
        conversation_text = "\n".join([
            f"{msg.role.upper()}: {msg.content}"
            for msg in conversation
        ])
        
        search_context = json.dumps(search_results, indent=2)
        
        eval_model = "gpt-5.1"
        print(f"[Factuality Agent] Using model: {eval_model}")
        
        response = openai_client.chat.completions.create(
            model=eval_model,  # Higher accuracy for factuality - critical!
            messages=[
                {"role": "system", "content": FACTUALITY_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Conversation:\n{conversation_text}\n\nSearch Results:\n{search_context}"
                },
            ],
            response_format={"type": "json_object"},
            max_completion_tokens=600,  # GPT-5 models - no custom temperature allowed
        )
        
        result = json.loads(response.choices[0].message.content)
        
        return FactualityResult(
            score=max(0, min(1, float(result.get("score", 0.7)))),
            hallucination_likelihood=max(0, min(1, float(result.get("hallucination_likelihood", 0.3)))),
            corrected_facts=result.get("corrected_facts", []),
            sources_checked=list(set(sources_checked))[:10],  # Dedupe and limit
        )
    except Exception as e:
        return FactualityResult(
            score=0.5,
            hallucination_likelihood=0.5,
            corrected_facts=[f"Evaluation error: {str(e)}"],
            sources_checked=[],
        )

