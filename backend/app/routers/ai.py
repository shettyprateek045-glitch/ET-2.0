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
        session_id=request.session_id,
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

@router.get("/agents/spec-compliance")
def spec_compliance(doc_text: str = ""):
    return AIService.spec_compliance_agent(doc_text)

@router.get("/agents/schedule-risk")
def schedule_risk():
    return AIService.schedule_risk_engine()

@router.get("/agents/supply-chain")
def supply_chain():
    return AIService.supply_chain_risk_agent()

@router.get("/agents/commissioning-copilot")
def commissioning_copilot():
    return AIService.commissioning_copilot()

@router.get("/agents/project-knowledge-rfi")
def rfi_agent(query: str = Query(...)):
    return AIService.project_knowledge_rfi_agent(query)
