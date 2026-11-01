from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Investigation, CAPA, InvestigationEvidence
from app.schemas import ProcessTextRequest, RCAAnalysisResponse, InvestigationSaveRequest
from app.services.pdf_service import extract_text_from_pdf
from app.ai.graph import run_rca_pipeline

router = APIRouter(prefix="/api/rca", tags=["Root Cause Analysis"])

@router.post("/process-text")
def process_text(req: ProcessTextRequest):
    combined_text = req.text
    if req.source_type == "EMAIL" and req.email_subject:
        combined_text = f"Subject: {req.email_subject}\nSender: {req.email_sender or 'Unknown'}\n\n{req.text}"
    
    analysis_result = run_rca_pipeline(combined_text, req.source_type)
    return analysis_result

@router.post("/process-document")
async def process_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF documents are supported")
    
    file_bytes = await file.read()
    extracted_text = extract_text_from_pdf(file_bytes)
    analysis_result = run_rca_pipeline(extracted_text, "PDF")
    analysis_result["filename"] = file.filename
    return analysis_result

@router.post("/analyze")
def analyze_custom(req: ProcessTextRequest):
    return run_rca_pipeline(req.text, req.source_type)

@router.post("/save")
def save_investigation(inv_data: InvestigationSaveRequest, db: Session = Depends(get_db)):
    # Check if investigation with deviation_id exists
    existing = db.query(Investigation).filter(Investigation.deviation_id == inv_data.deviation_id).first()
    if existing:
        db_inv = existing
    else:
        db_inv = Investigation(deviation_id=inv_data.deviation_id)
    
    db_inv.title = inv_data.title
    db_inv.description = inv_data.description
    db_inv.source_type = inv_data.source_type
    db_inv.occurrence_date = inv_data.occurrence_date
    db_inv.reported_date = inv_data.reported_date
    db_inv.department = inv_data.department
    db_inv.batch_number = inv_data.batch_number
    db_inv.product_name = inv_data.product_name
    db_inv.manufacturing_stage = inv_data.manufacturing_stage
    db_inv.equipment = inv_data.equipment
    db_inv.severity = inv_data.severity
    db_inv.immediate_action = inv_data.immediate_action
    db_inv.extracted_data = inv_data.extracted_data
    db_inv.five_whys = inv_data.five_whys
    db_inv.fishbone = inv_data.fishbone
    db_inv.root_causes = inv_data.root_causes
    db_inv.evidence_gaps = inv_data.evidence_gaps
    db_inv.capas = inv_data.capas
    db_inv.investigation_status = inv_data.investigation_status or "Open"

    db.add(db_inv)
    db.commit()
    db.refresh(db_inv)

    # Sync CAPA child records if present
    if inv_data.capas:
        for capa_item in inv_data.capas:
            capa_id = capa_item.get("id")
            existing_capa = db.query(CAPA).filter(CAPA.id == capa_id).first() if capa_id else None
            if not existing_capa:
                existing_capa = CAPA(
                    investigation_id=db_inv.id,
                    capa_type=capa_item.get("capa_type", "Corrective"),
                    description=capa_item.get("description", ""),
                    justification=capa_item.get("justification", ""),
                    responsible_department=capa_item.get("responsible_department", ""),
                    owner=capa_item.get("owner", ""),
                    priority=capa_item.get("priority", "Medium"),
                    target_date=capa_item.get("target_date", ""),
                    verification_method=capa_item.get("verification_method", ""),
                    effectiveness_criteria=capa_item.get("effectiveness_criteria", ""),
                    status=capa_item.get("status", "Proposed")
                )
                db.add(existing_capa)
        db.commit()

    return db_inv

@router.get("/investigations")
def get_investigations(db: Session = Depends(get_db)):
    return db.query(Investigation).order_by(Investigation.created_at.desc()).all()

@router.get("/investigations/{inv_id}")
def get_investigation(inv_id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter((Investigation.id == inv_id) | (Investigation.deviation_id == inv_id)).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")
    return inv

@router.put("/investigations/{inv_id}")
def update_investigation(inv_id: str, inv_data: InvestigationSaveRequest, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")
    
    inv.title = inv_data.title
    inv.description = inv_data.description
    inv.severity = inv_data.severity
    inv.department = inv_data.department
    inv.investigation_status = inv_data.investigation_status
    inv.five_whys = inv_data.five_whys
    inv.fishbone = inv_data.fishbone
    inv.root_causes = inv_data.root_causes
    inv.evidence_gaps = inv_data.evidence_gaps
    inv.capas = inv_data.capas
    
    db.commit()
    db.refresh(inv)
    return inv

@router.delete("/investigations/{inv_id}")
def delete_investigation(inv_id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")
    db.delete(inv)
    db.commit()
    return {"message": "Investigation successfully deleted"}
