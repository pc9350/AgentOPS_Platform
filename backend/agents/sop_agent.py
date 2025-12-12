"""
SOP Compliance Agent
Checks if responses follow internal Standard Operating Procedure rules.
"""
from typing import List
from openai import OpenAI
import json
from pathlib import Path

from config import get_settings
from db.models import SOPComplianceResult, SOPViolation, ConversationMessage


def load_sop_rules() -> dict:
    """Load SOP rules from JSON file."""
    rules_path = Path(__file__).parent / "sop_rules.json"
    if rules_path.exists():
        with open(rules_path, "r") as f:
            return json.load(f)
    return {"rules": []}


SOP_SYSTEM_PROMPT = """You are a compliance checker evaluating AI responses against internal SOP (Standard Operating Procedure) rules.

You will be given:
1. A conversation between a user and an AI assistant
2. A list of SOP rules to check against

For each rule, determine if it was violated. Return your evaluation as JSON with:
- compliant: boolean - true if no violations
- violations: array of violations, each with:
  - rule_id: ID of the violated rule
  - rule_name: Name of the rule
  - severity: "low", "medium", "high", or "critical"
  - description: How the rule was violated

Be thorough but fair. Only flag clear violations.

Example output:
{
    "compliant": false,
    "violations": [
        {
            "rule_id": "SOP-001",
            "rule_name": "Professional Tone",
            "severity": "low",
            "description": "Response used casual language in a formal context"
        }
    ]
}"""


async def evaluate_sop_compliance(
    conversation: List[ConversationMessage],
) -> SOPComplianceResult:
    """
    Evaluate if a conversation response complies with SOP rules.
    
    Args:
        conversation: List of conversation messages
        
    Returns:
        SOPComplianceResult with compliance status and violations
    """
    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)
    
    # Load SOP rules
    sop_config = load_sop_rules()
    rules = sop_config.get("rules", [])
    
    if not rules:
        return SOPComplianceResult(
            compliant=True,
            violations=[],
            severity_summary={},
        )
    
    # Format conversation
    conversation_text = "\n".join([
        f"{msg.role.upper()}: {msg.content}"
        for msg in conversation
    ])
    
    rules_text = json.dumps(rules, indent=2)
    
    try:
        eval_model = "gpt-5-mini"
        print(f"[SOP Agent] Using model: {eval_model}")
        
        response = client.chat.completions.create(
            model=eval_model,  # 2025 model - better rule compliance checking
            messages=[
                {"role": "system", "content": SOP_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Check this conversation against SOP rules:\n\nConversation:\n{conversation_text}\n\nSOP Rules:\n{rules_text}"
                },
            ],
            response_format={"type": "json_object"},
            max_completion_tokens=800,  # GPT-5 models - no custom temperature allowed
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Parse violations
        violations = []
        severity_summary = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        
        for v in result.get("violations", []):
            violation = SOPViolation(
                rule_id=v.get("rule_id", "unknown"),
                rule_name=v.get("rule_name", "Unknown Rule"),
                severity=v.get("severity", "low"),
                description=v.get("description", "No description"),
            )
            violations.append(violation)
            severity = v.get("severity", "low").lower()
            if severity in severity_summary:
                severity_summary[severity] += 1
        
        return SOPComplianceResult(
            compliant=result.get("compliant", len(violations) == 0),
            violations=violations,
            severity_summary=severity_summary,
        )
    except Exception as e:
        return SOPComplianceResult(
            compliant=True,
            violations=[
                SOPViolation(
                    rule_id="ERROR",
                    rule_name="Evaluation Error",
                    severity="low",
                    description=f"SOP evaluation failed: {str(e)}",
                )
            ],
            severity_summary={"low": 1, "medium": 0, "high": 0, "critical": 0},
        )

