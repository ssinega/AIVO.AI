from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models import CAPA, Investigation

router = APIRouter(prefix="/api/capa", tags=["CAPA Management"])

@router.get("")
def list_capas(db: Session = Depends(get_db)):
    return db.query(CAPA).all()

@router.post("")
def create_capa(capa_data: Dict[str, Any], db: Session = Depends(get_db)):
    inv_id = capa_data.get("investigation_id")
    if not inv_id:
        # Fallback to first investigation if not specified
        first_inv = db.query(Investigation).first()
        if first_inv:
            inv_id = first_inv.id
        else:
            inv_id = "DEMO-INV-01"

    new_capa = CAPA(
        investigation_id=inv_id,
        capa_type=capa_data.get("capa_type", "Corrective"),
        description=capa_data.get("description", "New CAPA item"),
        justification=capa_data.get("justification", ""),
        responsible_department=capa_data.get("responsible_department", "Quality Control"),
        owner=capa_data.get("owner", "QA Lead"),
        priority=capa_data.get("priority", "Medium"),
        target_date=capa_data.get("target_date", "2026-11-30"),
        verification_method=capa_data.get("verification_method", ""),
        effectiveness_criteria=capa_data.get("effectiveness_criteria", ""),
        status=capa_data.get("status", "Proposed")
    )
    db.add(new_capa)
    db.commit()
    db.refresh(new_capa)
    return new_capa

@router.put("/{capa_id}")
def update_capa(capa_id: str, capa_data: Dict[str, Any], db: Session = Depends(get_db)):
    capa = db.query(CAPA).filter(CAPA.id == capa_id).first()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA record not found")
    
    for key, val in capa_data.items():
        if hasattr(capa, key) and key != "id":
            setattr(capa, key, val)
    
    db.commit()
    db.refresh(capa)
    return capa

@router.delete("/{capa_id}")
def delete_capa(capa_id: str, db: Session = Depends(get_db)):
    capa = db.query(CAPA).filter(CAPA.id == capa_id).first()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA record not found")
    db.delete(capa)
    db.commit()
    return {"message": "CAPA record deleted"}
