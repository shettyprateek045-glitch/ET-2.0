from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Project, QualityIssue, PurchaseOrder, CommissioningItem
from app.services.report_service import ReportService
import io

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/export")
def export_report(
    report_type: str = Query(..., description="projects, quality, procurement, commissioning"),
    file_format: str = Query(..., description="pdf, xlsx, csv"),
    db: Session = Depends(get_db)
):
    # 1. Fetch relevant data
    raw_data = []
    headers = []
    filename = f"report_{report_type}_{file_format}"
    
    if report_type == "projects":
        projects = db.query(Project).all()
        raw_data = [
            {
                "ID": p.id,
                "Project Name": p.name,
                "Location": p.location,
                "MW Capacity": p.capacity_mw,
                "Budget ($M)": p.budget_million,
                "Budget Used ($M)": p.budget_used,
                "Status": p.status,
                "AI Health Score": p.ai_health_score
            }
            for p in projects
        ]
        headers = ["ID", "Project Name", "Location", "MW Capacity", "Budget ($M)", "Budget Used ($M)", "Status", "AI Health Score"]
        
    elif report_type == "quality":
        issues = db.query(QualityIssue).all()
        raw_data = [
            {
                "ID": i.id,
                "Project ID": i.project_id,
                "Title": i.title,
                "Severity": i.severity,
                "Status": i.status,
                "Reported By": i.reported_by,
                "Assigned To": i.assigned_to,
                "Created At": i.created_at.strftime("%Y-%m-%d") if i.created_at else ""
            }
            for i in issues
        ]
        headers = ["ID", "Project ID", "Title", "Severity", "Status", "Reported By", "Assigned To", "Created At"]
        
    elif report_type == "procurement":
        pos = db.query(PurchaseOrder).all()
        raw_data = [
            {
                "PO Number": p.po_number,
                "Item Name": p.item_name,
                "Qty": p.quantity,
                "Cost ($)": p.cost,
                "Supplier": p.supplier_name,
                "Supplier Risk": p.supplier_risk,
                "Shipping Status": p.status,
                "Tracking Log": p.tracking_status
            }
            for p in pos
        ]
        headers = ["PO Number", "Item Name", "Qty", "Cost ($)", "Supplier", "Supplier Risk", "Shipping Status", "Tracking Log"]
        
    elif report_type == "commissioning":
        items = db.query(CommissioningItem).all()
        raw_data = [
            {
                "ID": item.id,
                "System": item.system_name,
                "Component": item.component_name,
                "Verification State": item.status,
                "Certifying Engineer": item.tester_name or "Unassigned",
                "Sign-off Date": item.test_date.strftime("%Y-%m-%d") if item.test_date else "Pending"
            }
            for item in items
        ]
        headers = ["ID", "System", "Component", "Verification State", "Certifying Engineer", "Sign-off Date"]
    
    else:
        raise HTTPException(status_code=400, detail="Invalid report type")

    if not raw_data:
        # Provide dummy structure if DB is empty
        raw_data = [{"Message": "No data found for this report filter."}]
        headers = ["Message"]

    # 2. Compile output format
    if file_format == "csv":
        media_bytes = ReportService.generate_csv_report(raw_data, headers)
        return Response(
            content=media_bytes,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}.csv"}
        )
        
    elif file_format == "xlsx":
        media_bytes = ReportService.generate_excel_report(raw_data)
        return Response(
            content=media_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}.xlsx"}
        )
        
    elif file_format == "pdf":
        media_bytes = ReportService.generate_pdf_report(f"EPC {report_type.capitalize()} Audit Ledger", raw_data)
        return Response(
            content=media_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}.pdf"}
        )
        
    else:
        raise HTTPException(status_code=400, detail="Invalid file format")
