export type SeverityLevel = 'Critical' | 'Major' | 'Moderate' | 'Minor';
export type InvestigationStatus = 'Open' | 'Under Investigation' | 'Under Quality Review' | 'Completed' | 'Closed';
export type CapaStatus = 'Proposed' | 'Under Review' | 'Approved' | 'In Progress' | 'Completed' | 'Effectiveness Check' | 'Closed';
export type CapaType = 'Corrective' | 'Preventive';
export type EvidenceStatus = 'Pending' | 'Requested' | 'Received' | 'Reviewed';
export type RootCauseStatus = 'AI Suggested' | 'Under Verification' | 'Verified' | 'Rejected';

export interface ExtractedInfo {
  deviation_id: string;
  title: string;
  description: string;
  occurrence_date: string;
  reported_date: string;
  department: string;
  batch_number: string;
  product_name: string;
  manufacturing_stage: string;
  equipment: string;
  severity: SeverityLevel;
  immediate_action: string;
  observed_impact: string;
  investigation_owner: string;
  field_metadata?: Record<string, { origin?: string; missing?: boolean }>;
}

export interface FiveWhyItem {
  level: number;
  question: string;
  answer: string;
  supporting_evidence: string;
  confidence: 'Observed Fact' | 'Possible Contributing Factor' | 'Potential Root Cause' | 'Confirmed Root Cause';
  reviewer_notes?: string;
  is_verified?: boolean;
}

export interface FishboneFactor {
  name: string;
  description: string;
  evidence: string;
  status: string;
}

export interface FishboneCategory {
  category: 'Manpower' | 'Machine' | 'Method' | 'Material' | 'Measurement' | 'Environment';
  factors: FishboneFactor[];
}

export interface RootCause {
  id: string;
  description: string;
  category: string;
  supporting_evidence: string;
  evidence_gaps: string;
  confidence_level: string;
  verification_method: string;
  status: RootCauseStatus;
}

export interface EvidenceAttachment {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  data_url?: string;
  notes?: string;
}

export interface EvidenceGap {
  id: string;
  missing_evidence: string;
  evidence_category: string;
  reason_required: string;
  related_root_cause: string;
  recommended_activity: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: EvidenceStatus;
  attachments?: EvidenceAttachment[];
}

export interface CapaItem {
  id: string;
  investigation_id?: string;
  capa_type: CapaType;
  description: string;
  justification: string;
  related_root_cause?: string;
  responsible_department: string;
  owner: string;
  priority: 'High' | 'Medium' | 'Low';
  target_date: string;
  verification_method: string;
  effectiveness_criteria: string;
  status: CapaStatus;
  created_at?: string;
}

export interface Investigation {
  id: string;
  deviation_id: string;
  title: string;
  description: string;
  source_type: 'PDF' | 'TEXT' | 'EMAIL';
  occurrence_date: string;
  reported_date: string;
  department: string;
  batch_number: string;
  product_name: string;
  manufacturing_stage: string;
  equipment: string;
  severity: SeverityLevel;
  immediate_action: string;
  extracted_data: ExtractedInfo;
  five_whys: FiveWhyItem[];
  fishbone: FishboneCategory[];
  root_causes: RootCause[];
  evidence_gaps: EvidenceGap[];
  capas: CapaItem[];
  investigation_status: InvestigationStatus;
  created_at: string;
  updated_at?: string;
}

export interface DashboardMetrics {
  total_investigations: number;
  open_investigations: number;
  under_investigation: number;
  completed_investigations: number;
  pending_capas: number;
  overdue_capas: number;
  monthly_trend: Array<{ month: string; investigations: number; closed: number }>;
  status_distribution: Array<{ name: string; value: number; color: string }>;
  category_distribution: Array<{ category: string; count: number }>;
  capa_completion: Array<{ status: string; count: number }>;
}
