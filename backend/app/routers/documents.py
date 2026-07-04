import os
import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import DocumentMetadata
from app.schemas.schemas import DocumentMetadataResponse
from app.services.ocr_service import OCRService
from app.services.ai_service import AIService
from typing import List, Optional

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = "./uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.get("/", response_model=List[DocumentMetadataResponse])
def get_documents(project_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(DocumentMetadata)
    if project_id:
        query = query.filter(DocumentMetadata.project_id == project_id)
    return query.all()

@router.post("/upload")
async def upload_document(
    project_id: int = Form(...),
    doc_type: str = Form(...),
    uploaded_by: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        
        # Save file to local uploads directory
        with open(file_path, "wb") as f:
            f.write(content)
            
        # Run OCR extraction
        ocr_text = OCRService.extract_text(file.filename, content)
        
        new_doc = DocumentMetadata(
            project_id=project_id,
            filename=file.filename,
            file_path=file_path,
            doc_type=doc_type,
            ocr_text=ocr_text,
            uploaded_by=uploaded_by,
            approved_status="Pending",
            version=1
        )
        
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        
        return {
            "message": "File uploaded successfully",
            "document": {
                "id": new_doc.id,
                "filename": new_doc.filename,
                "doc_type": new_doc.doc_type,
                "approved_status": new_doc.approved_status,
                "version": new_doc.version
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")

@router.get("/{doc_id}")
def get_document_details(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(DocumentMetadata).filter(DocumentMetadata.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "id": doc.id,
        "filename": doc.filename,
        "file_path": doc.file_path,
        "doc_type": doc.doc_type,
        "ocr_text": doc.ocr_text,
        "approved_status": doc.approved_status,
        "version": doc.version,
        "uploaded_by": doc.uploaded_by,
        "uploaded_at": doc.uploaded_at
    }

@router.put("/{doc_id}/approve")
def approve_document(doc_id: int, status: str, db: Session = Depends(get_db)):
    if status not in ["Approved", "Rejected", "Pending"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    doc = db.query(DocumentMetadata).filter(DocumentMetadata.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.approved_status = status
    db.commit()
    return {"message": f"Document status updated to {status}", "id": doc_id}

@router.get("/search/semantic")
def search_documents(query: str, db: Session = Depends(get_db)):
    """Simulate RAG semantic search across vectors."""
    rag_result = AIService.project_knowledge_rfi_agent(query)
    return {
        "query": query,
        "answer": rag_result["answer"],
        "sources": rag_result["sources"]
    }

@router.get("/{doc_id}/summary")
def get_document_summary(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(DocumentMetadata).filter(DocumentMetadata.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    summary = AIService.generate_document_summary(doc.filename, doc.ocr_text)
    return {"id": doc_id, "filename": doc.filename, "summary": summary}

