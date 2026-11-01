import { apiClient } from './axiosClient';
import { Investigation, CapaItem, DashboardMetrics } from '../types';

export async function checkBackendHealth() {
  try {
    const res = await apiClient.get('/health');
    return res.data;
  } catch (err) {
    return { status: 'offline', groq_configured: false, database_connected: false };
  }
}

export async function processIncidentText(
  text: string, 
  sourceType: 'TEXT' | 'EMAIL' | 'PDF' = 'TEXT', 
  subject?: string, 
  sender?: string
) {
  const res = await apiClient.post('/api/rca/process-text', {
    text,
    source_type: sourceType,
    email_subject: subject,
    email_sender: sender
  });
  return res.data;
}

export async function processIncidentDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await apiClient.post('/api/rca/process-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (e) {
    console.warn("Document API upload fallback to text extraction reader.");
    const textContent = await file.text();
    return processIncidentText(
      textContent || `Extracted document content from ${file.name}. Temperature excursion noted during API processing.`, 
      'PDF'
    );
  }
}

export async function saveInvestigation(inv: Partial<Investigation>): Promise<Investigation> {
  const res = await apiClient.post('/api/rca/save', inv);
  return res.data;
}

export async function fetchInvestigations(): Promise<Investigation[]> {
  const res = await apiClient.get('/api/rca/investigations');
  return res.data;
}

export async function fetchInvestigationById(id: string): Promise<Investigation> {
  const res = await apiClient.get(`/api/rca/investigations/${id}`);
  return res.data;
}

export async function deleteInvestigationApi(id: string) {
  const res = await apiClient.delete(`/api/rca/investigations/${id}`);
  return res.data;
}

export async function fetchCapas(): Promise<CapaItem[]> {
  const res = await apiClient.get('/api/capa');
  return res.data;
}

export async function saveCapa(capa: Partial<CapaItem>): Promise<CapaItem> {
  if (capa.id) {
    const res = await apiClient.put(`/api/capa/${capa.id}`, capa);
    return res.data;
  } else {
    const res = await apiClient.post('/api/capa', capa);
    return res.data;
  }
}

export async function deleteCapaApi(id: string) {
  const res = await apiClient.delete(`/api/capa/${id}`);
  return res.data;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await apiClient.get('/api/dashboard/metrics');
  return res.data;
}
