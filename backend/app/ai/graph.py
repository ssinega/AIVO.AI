from langgraph.graph import StateGraph, END
from app.ai.state import InvestigationState
from app.ai.nodes import (
    extract_incident_information,
    validate_extracted_information,
    analyze_root_causes,
    perform_five_whys,
    perform_fishbone_analysis,
    identify_evidence_gaps,
    generate_capa_recommendations,
    finalize_investigation
)

def create_rca_graph():
    """
    Builds the LangGraph StateGraph for Pharmaceutical RCA Investigation Workflow.
    Nodes:
    1. extract_incident_information
    2. validate_extracted_information
    3. analyze_root_causes
    4. perform_five_whys
    5. perform_fishbone_analysis
    6. identify_evidence_gaps
    7. generate_capa_recommendations
    8. finalize_investigation
    """
    workflow = StateGraph(InvestigationState)

    workflow.add_node("extract_information", extract_incident_information)
    workflow.add_node("validate_information", validate_extracted_information)
    workflow.add_node("analyze_root_causes", analyze_root_causes)
    workflow.add_node("perform_five_whys", perform_five_whys)
    workflow.add_node("perform_fishbone", perform_fishbone_analysis)
    workflow.add_node("identify_evidence_gaps", identify_evidence_gaps)
    workflow.add_node("generate_capas", generate_capa_recommendations)
    workflow.add_node("finalize", finalize_investigation)

    # Set entry point
    workflow.set_entry_point("extract_information")

    # Connect workflow edges sequentially
    workflow.add_edge("extract_information", "validate_information")
    workflow.add_edge("validate_information", "analyze_root_causes")
    workflow.add_edge("analyze_root_causes", "perform_five_whys")
    workflow.add_edge("perform_five_whys", "perform_fishbone")
    workflow.add_edge("perform_fishbone", "identify_evidence_gaps")
    workflow.add_edge("identify_evidence_gaps", "generate_capas")
    workflow.add_edge("generate_capas", "finalize")
    workflow.add_edge("finalize", END)

    return workflow.compile()

# Instantiated graph ready for invocation
rca_pipeline = create_rca_graph()

def run_rca_pipeline(source_text: str, source_type: str = "TEXT") -> dict:
    initial_state: InvestigationState = {
        "source_text": source_text,
        "source_type": source_type,
        "extracted_information": {},
        "validation_results": [],
        "five_whys": [],
        "fishbone": [],
        "potential_root_causes": [],
        "evidence_gaps": [],
        "capa_recommendations": [],
        "review_status": "Draft",
        "error": None
    }
    result = rca_pipeline.invoke(initial_state)
    return result
