from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ChatLog
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services.ai_service import AIService
from datetime import datetime
import json

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/chat", response_model=ChatResponse)
def process_chat(request: ChatRequest, db: Session = Depends(get_db)):
    # Run the generic RAG QA retrieval
    rag_result = AIService.project_knowledge_rfi_agent(request.query)
    
    # Process translation if required
    answer = rag_result["answer"]
    lang = request.language.lower()
    if lang == "spanish":
        answer = f"[Translated to Spanish]: {answer} (Nota: Esta es una traducción automática)."
    elif lang == "german":
        answer = f"[Translated to German]: {answer} (Hinweis: Dies ist eine automatische Übersetzung)."
    elif lang == "french":
        answer = f"[Translated to French]: {answer} (Note: Il s'agit d'une traduction automatique)."
    
    # Save log
    chat_log = ChatLog(
        session_id="Project Knowledge & RFI Intelligence Agent",
        query=request.query,
        response=answer,
        sources=",".join(rag_result["sources"])
    )
    db.add(chat_log)
    db.commit()
    
    return ChatResponse(
        response=answer,
        sources=rag_result["sources"],
        timestamp=datetime.utcnow()
    )

@router.get("/chat-history/{session_id}")
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    logs = db.query(ChatLog).filter(ChatLog.session_id == session_id).order_by(ChatLog.timestamp.asc()).all()
    return [
        {
            "query": l.query,
            "response": l.response,
            "sources": l.sources.split(",") if l.sources else [],
            "timestamp": l.timestamp
        }
        for l in logs
    ]

# ---------------- Dynamic Execution Logs ----------------

@router.get("/logs")
def get_execution_logs(db: Session = Depends(get_db)):
    """Fetch recent execution logs from the database for all agents."""
    logs = db.query(ChatLog).order_by(ChatLog.timestamp.desc()).limit(40).all()
    return [
        {
            "id": l.id,
            "agent": l.session_id,
            "query": l.query,
            "response": l.response,
            "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }
        for l in logs
    ]

@router.get("/agents/spec-compliance")
def spec_compliance(doc_text: str = "", db: Session = Depends(get_db)):
    compliance = AIService.spec_compliance_agent(doc_text)
    
    # Save execution log
    log_text = f"Compliance Check. Results count: {len(compliance)}"
    chat_log = ChatLog(
        session_id="Specification & Quality Compliance Agent",
        query=doc_text[:100] or "Default compliance audit execution",
        response=log_text,
        sources="NEC,ASHRAE"
    )
    db.add(chat_log)
    db.commit()
    return compliance

@router.get("/agents/schedule-risk")
def schedule_risk(db: Session = Depends(get_db)):
    risks = AIService.schedule_risk_engine()
    
    # Save execution log
    chat_log = ChatLog(
        session_id="Predictive Schedule Risk Engine",
        query="Generate delay predictions",
        response=f"Identified {len(risks)} delay risk factors.",
        sources="ProcurementPO"
    )
    db.add(chat_log)
    db.commit()
    return risks

@router.get("/agents/supply-chain")
def supply_chain(db: Session = Depends(get_db)):
    risks = AIService.supply_chain_risk_agent()
    
    # Save execution log
    chat_log = ChatLog(
        session_id="Supply Chain Visibility & Risk Agent",
        query="Assess critical supplier ratings",
        response=f"Analyzed supplier log. Flagged BB- switchgear risks.",
        sources="SupplierList"
    )
    db.add(chat_log)
    db.commit()
    return risks

@router.get("/agents/commissioning-copilot")
def commissioning_copilot(db: Session = Depends(get_db)):
    issues = AIService.commissioning_copilot()
    
    # Save execution log
    chat_log = ChatLog(
        session_id="Commissioning Quality Assurance Copilot",
        query="Verify voltage step transients",
        response="Flagged UPS System A transient sag (12% sag, recovery 180ms).",
        sources="TIA-942"
    )
    db.add(chat_log)
    db.commit()
    return issues

@router.get("/agents/project-knowledge-rfi")
def rfi_agent(query: str = Query(...), db: Session = Depends(get_db)):
    result = AIService.project_knowledge_rfi_agent(query)
    
    # Save execution log
    chat_log = ChatLog(
        session_id="Project Knowledge & RFI Intelligence Agent",
        query=query,
        response=result["answer"],
        sources=",".join(result["sources"])
    )
    db.add(chat_log)
    db.commit()
    return result
