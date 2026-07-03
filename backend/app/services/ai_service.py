import os
import random
import httpx
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Mock databases for domain-specific responses
COMPLIANCE_RESPONSES = [
    {
        "clause": "Sec 4.2.1: Generator Fuel Supply Layout",
        "status": "Non-Compliant",
        "details": "The design specifies a single 10,000-gallon belly tank without secondary containment, violating EPA Tier 4 requirements and local fire safety codes which require 110% containment capacity.",
        "remediation": "Redesign with dual-walled tanks or implement a concrete containment dike around the storage unit."
    },
    {
        "clause": "Sec 8.1.3: Chilled Water Piping Redundancy",
        "status": "Compliant",
        "details": "N+2 piping loops meet the Tier III design topology requested by the client.",
        "remediation": "None"
    },
    {
        "clause": "Sec 12.2.4: UPS Room Ventilation",
        "status": "Warning",
        "details": "Airflow calculations show only 8 ACH (Air Changes per Hour). ASHRAE 90.4 recommends 10 ACH minimum for high-density lithium-ion battery configurations to prevent localized thermal runaways.",
        "remediation": "Increase ventilation duct dimensions or add inline booster fans to meet 10-12 ACH target."
    }
]

SCHEDULE_RISKS = [
    {
        "activity": "HVAC Chiller Delivery & Rigging",
        "original_date": "2026-09-15",
        "predicted_delay_days": 24,
        "probability": 85.0,
        "impact": "Critical Path",
        "reasons": "Global shipping backlog on scroll chillers, port congestion in Rotterdam, and rigging crane rental availability constraints in Dublin.",
        "mitigation": "Pre-order with air-freight option or adjust structural ceiling milestones to permit delayed chiller installation via side panels."
    },
    {
        "activity": "Medium Voltage Grid Connection",
        "original_date": "2026-11-01",
        "predicted_delay_days": 45,
        "probability": 72.0,
        "impact": "High",
        "reasons": "Utility provider transformer backlog and environmental clearance delays on the easement pathway.",
        "mitigation": "Deploy temporary 2MW generator package for initial subsystem commissioning and fast-track permit filings through executive liaison."
    }
]

SUPPLIER_RISKS = [
    {
        "supplier": "Apex Switchgear Ltd",
        "risk_level": "High",
        "components": "Medium Voltage Switchgear panels",
        "financial_stability": "Weak (recent credit downgrade to BB-)",
        "delivery_reliability": "68% on-time rate over past 6 months",
        "mitigation": "Establish contact with backup suppliers (Schneider/Eaton) and hold 15% progress payment in escrow until factory acceptance testing (FAT) is cleared."
    },
    {
        "supplier": "Boreas Cooling Systems",
        "risk_level": "Medium",
        "components": "Computer Room Air Handlers (CRAHs)",
        "financial_stability": "Stable",
        "delivery_reliability": "89% on-time rate, but raw copper shortages are stretching lead times.",
        "mitigation": "Approve alternative material usage or pre-purchase copper billets to secure manufacturing slot."
    }
]

COMMISSIONING_ISSUES = [
    {
        "system": "UPS System A",
        "check": "Load bank testing (100% load step)",
        "status": "Failed",
        "observation": "Voltage transient sag exceeded 12% on step load change, recovery time was 180ms (specification allows max 10% sag, 100ms recovery).",
        "solution": "Adjust governor parameters on generator control modules and recalibrate UPS static bypass switch sensitivity."
    },
    {
        "system": "Fire Suppression Subsystem",
        "check": "Pre-action valve dry-run release",
        "status": "Passed",
        "observation": "Solenoid valve triggered within 4.2 seconds of dual-zone alarm activation.",
        "solution": "None"
    }
]

RAG_KNOWLEDGE_BASE = [
    {
        "query_keywords": ["rfi", "generator", "belly tank", "fuel", "containment"],
        "answer": "RFI-104 addresses the generator fuel containment: The engineering team confirmed that dual-walled steel belly tanks with integrated leak detection satisfy the secondary containment requirements of Section 4.2.1. A separate concrete dike is not required if dual-wall is deployed.",
        "source": "RFI-104 Response - Fuel System Redesign.pdf"
    },
    {
        "query_keywords": ["chiller", "flow", "cooling", "piping", "redundancy"],
        "answer": "Drawing DC-ME-302 outlines the N+2 piping loops. In the event of a primary chiller failure, motorized isolation valves (MV-102 and MV-103) automatically cycle to reroute water flow through bypass loop C.",
        "source": "DC-ME-302 Mechanical Piping Details.dwg"
    },
    {
        "query_keywords": ["concrete", "foundation", "curing", "strength"],
        "answer": "Meeting Minutes from June 12 state that foundation pour for Generator Pad 3 achieved 3,500 psi compressive strength at day 7. Total curing period before heavy equipment placement must be 28 days (achieving 5,000 psi).",
        "source": "Meeting_Minutes_2026-06-12.docx"
    }
]

async def call_llm(system_prompt: str, user_prompt: str) -> str:
    """Helper to call Gemini or OpenAI if configured, otherwise fall back to smart generative template."""
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Generate simulated intelligent response based on prompts
        if "compliance" in user_prompt.lower() or "specification" in system_prompt.lower():
            return f"Compliance Audit Report:\n\nBased on scanning the document, we identified 3 key sections:\n1. EPA Tier 4 Belly Tank Containment: Status: NON-COMPLIANT. Details: Lacks 110% secondary dike.\n2. Chilled Water Piping Loop: Status: COMPLIANT. Meets N+2 requirement.\n3. Battery Ventilation: Status: WARNING. ASHRAE 90.4 recommends 10 ACH, design shows 8 ACH.\n\nRecommended Action: Update tank spec to dual-wall and increase blower rating to 1,200 CFM."
        elif "schedule" in user_prompt.lower() or "delay" in system_prompt.lower():
            return f"Schedule Risk Analysis:\n\nChiller rigging schedule at risk (predicted delay: 24 days, probability 85%) due to port delays in Rotterdam.\nMV Grid Connection at risk (predicted delay: 45 days, probability 72%) due to easement disputes and transformer lead times.\n\nMitigation: Pre-order backup generators and secure rigging contractor early."
        else:
            return f"Agent Analysis Result:\n\nThe intelligence engine has processed the inputs. We detect high correlations between recent submittal backlogs and commissioning delays. Recommended strategy: Adjust manpower by +12% on piping installation to avoid cascading grid connection delay."
    
    # Simple API caller (mock HTTP client to OpenAI)
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            payload = {
                "model": "gpt-4-turbo" if "openai" in api_key.lower() else "gemini-1.5-flash",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            }
            url = "https://api.openai.com/v1/chat/completions" # Simplified
            response = await client.post(url, headers=headers, json=payload, timeout=10.0)
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
    except Exception:
        pass
    
    return "Intelligence engine active (using local fallback: API connection offline)."

class AIService:
    @staticmethod
    def spec_compliance_agent(doc_text: str) -> List[Dict[str, Any]]:
        # Simulated parsing
        return COMPLIANCE_RESPONSES

    @staticmethod
    def schedule_risk_engine() -> List[Dict[str, Any]]:
        return SCHEDULE_RISKS

    @staticmethod
    def supply_chain_risk_agent() -> List[Dict[str, Any]]:
        return SUPPLIER_RISKS

    @staticmethod
    def commissioning_copilot() -> List[Dict[str, Any]]:
        return COMMISSIONING_ISSUES

    @staticmethod
    def project_knowledge_rfi_agent(query: str) -> Dict[str, Any]:
        query_lower = query.lower()
        for item in RAG_KNOWLEDGE_BASE:
            if any(kw in query_lower for kw in item["query_keywords"]):
                return {
                    "answer": item["answer"],
                    "sources": [item["source"]]
                }
        
        # Fallback default answer
        return {
            "answer": "We found no direct matches in the vector database for your query. However, standard construction guidelines recommend filing an RFI (Request For Information) to the electrical engineer regarding cable tray loading capacities.",
            "sources": ["General Specifications - Electrical Subsystems.pdf"]
        }

    @staticmethod
    def get_ai_health_score() -> Dict[str, Any]:
        return {
            "score": 92.5,
            "breakdown": {
                "schedule_health": 88,
                "procurement_health": 91,
                "quality_health": 94,
                "commissioning_health": 97
            },
            "status": "Healthy"
        }
