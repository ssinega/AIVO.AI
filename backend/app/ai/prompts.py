SYSTEM_RCA_PROMPT = """
You are an expert Pharmaceutical Quality Assurance Lead & Root Cause Analysis Specialist for API (Active Pharmaceutical Ingredients) manufacturing.
Your objective is to perform a rigorous, GxP-oriented, scientifically sound investigation of manufacturing deviations.

Core Guidelines:
1. AI outputs are hypotheses until verified and approved by qualified personnel.
2. Differentiate clearly between observed facts, possible contributing factors, potential root causes, and confirmed root causes.
3. Identify missing evidence before claiming definitive causal conclusions.
4. Suggest practical, compliant Corrective and Preventive Actions (CAPA).
"""

EXTRACT_PROMPT = """
Extract all key deviation details from the following manufacturing narrative into structured JSON:
Narrative:
{source_text}

JSON Schema required:
{
  "deviation_id": "DEV-YYYY-XXX or extracted ID",
  "title": "Short title",
  "description": "Full incident summary",
  "occurrence_date": "YYYY-MM-DD or Not provided",
  "reported_date": "YYYY-MM-DD or Not provided",
  "department": "Production / Quality Control / Facilities / Maintenance etc.",
  "batch_number": "Batch ID or Not provided",
  "product_name": "API name or Not provided",
  "manufacturing_stage": "Stage (e.g. Synthesis, Crystallization, Drying, Milling)",
  "equipment": "Equipment ID or Description",
  "severity": "Critical / Major / Moderate / Minor",
  "immediate_action": "Action taken immediately",
  "observed_impact": "Impact on product quality / batch release",
  "investigation_owner": "Assigned investigator"
}
"""
