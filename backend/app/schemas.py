from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ProcessTextRequest(BaseModel):
    source_type: str = "TEXT" # TEXT, EMAIL
    text: str
    email_subject: Optional[str] = None
    email_sender: Optional[str] = None

class FiveWhyStep(BaseModel):
    level: int
    question: str
    answer: str
    supporting_evidence: str
    confidence: str # Observed Fact, Possible Contributing Factor, Potential Root Cause, Confirmed Root Cause
    reviewer_notes: Optional[str] = ""
    is_verified: bool = False

class FishboneCategory(BaseModel):
    category: str # Manpower, Machine, Method, Material, Measurement, Environment
    factors: List[Dict[str, Any]]

class RootCauseItem(BaseModel):
    id: str
    description: str
    category: str
    supporting_evidence: str
    evidence_gaps: str
    confidence_level: str
    verification_method: str
    status: str = "AI Suggested" # AI Suggested, Under Verification, Verified, Rejected

class EvidenceGapItem(BaseModel):
    id: str
    missing_evidence: str
    evidence_category: str
    reason_required: str
    related_root_cause: str
    recommended_activity: str
    priority: str = "High"
    status: str = "Pending" # Pending, Requested, Received, Reviewed

class CAPARecommendation(BaseModel):
    id: str
    capa_type: str # Corrective, Preventive
    description: str
    justification: str
    related_root_cause: str
    responsible_department: str
    owner: str
    priority: str # High, Medium, Low
    target_date: str
    verification_method: str
    effectiveness_criteria: str
    status: str = "Proposed"

class ExtractedInformation(BaseModel):
    deviation_id: str
    title: str
    description: str
    occurrence_date: str
    reported_date: str
    department: str
    batch_number: str
    product_name: str
    manufacturing_stage: str
    equipment: str
    severity: str
    immediate_action: str
    observed_impact: str
    investigation_owner: str
    field_metadata: Optional[Dict[str, Dict[str, Any]]] = {}

class RCAAnalysisResponse(BaseModel):
    extracted_information: ExtractedInformation
    validation_results: List[Dict[str, Any]]
    five_whys: List[FiveWhyStep]
    fishbone: List[FishboneCategory]
    potential_root_causes: List[RootCauseItem]
    evidence_gaps: List[EvidenceGapItem]
    capa_recommendations: List[CAPARecommendation]

class InvestigationSaveRequest(BaseModel):
    deviation_id: str
    title: str
    description: Optional[str] = ""
    source_type: Optional[str] = "TEXT"
    occurrence_date: Optional[str] = ""
    reported_date: Optional[str] = ""
    department: Optional[str] = ""
    batch_number: Optional[str] = ""
    product_name: Optional[str] = ""
    manufacturing_stage: Optional[str] = ""
    equipment: Optional[str] = ""
    severity: Optional[str] = "Moderate"
    immediate_action: Optional[str] = ""
    extracted_data: Optional[Dict[str, Any]] = None
    five_whys: Optional[List[Dict[str, Any]]] = None
    fishbone: Optional[List[Dict[str, Any]]] = None
    root_causes: Optional[List[Dict[str, Any]]] = None
    evidence_gaps: Optional[List[Dict[str, Any]]] = None
    capas: Optional[List[Dict[str, Any]]] = None
    investigation_status: Optional[str] = "Open"

class DashboardMetrics(BaseModel):
    total_investigations: int
    open_investigations: int
    under_investigation: int
    completed_investigations: int
    pending_capas: int
    overdue_capas: int
    monthly_trend: List[Dict[str, Any]]
    status_distribution: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    capa_completion: List[Dict[str, Any]]
