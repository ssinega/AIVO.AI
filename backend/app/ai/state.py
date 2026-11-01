from typing import TypedDict, List, Dict, Any, Optional

class InvestigationState(TypedDict):
    source_text: str
    source_type: str
    extracted_information: Dict[str, Any]
    validation_results: List[Dict[str, Any]]
    five_whys: List[Dict[str, Any]]
    fishbone: List[Dict[str, Any]]
    potential_root_causes: List[Dict[str, Any]]
    evidence_gaps: List[Dict[str, Any]]
    capa_recommendations: List[Dict[str, Any]]
    review_status: str
    error: Optional[str]
