from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import QualityIssue
from app.schemas.schemas import QualityIssueCreate, QualityIssueResponse
from app.services.ai_service import AIService
from typing import List

router = APIRouter(prefix="/quality", tags=["quality"])

@router.get("/", response_model=List[QualityIssueResponse])
def get_quality_issues(db: Session = Depends(get_db)):
    return db.query(QualityIssue).all()

@router.post("/", response_model=QualityIssueResponse)
def create_quality_issue(issue_in: QualityIssueCreate, db: Session = Depends(get_db)):
    new_issue = QualityIssue(**issue_in.model_dump())
    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)
    return new_issue

@router.get("/compliance-check")
def run_compliance_audit(document_text: str = ""):
    """Run Specification & Quality Compliance Agent scan."""
    compliance = AIService.spec_compliance_agent(document_text)
    return {
        "status": "Audit Complete",
        "compliance_score": 87.5,
        "results": compliance
    }

@router.put("/{issue_id}/resolve")
def resolve_quality_issue(issue_id: int, status: str, db: Session = Depends(get_db)):
    issue = db.query(QualityIssue).filter(QualityIssue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Quality issue not found")
    issue.status = status
    db.commit()
    return {"message": "Quality issue status updated", "id": issue_id, "status": status}
