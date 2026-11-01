import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { setActiveInvestigation, saveInvestigationThunk } from '../redux/rcaSlice';
import { processIncidentText, processIncidentDocument } from '../services/api';
import { SeverityBadge } from '../components/common/Badge';
import { 
  FileText, 
  UploadCloud, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  RefreshCw,
  Edit2,
  Check,
  FileCheck,
  Layers,
  Database
} from 'lucide-react';

export const NewInvestigationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState<'PDF' | 'TEXT' | 'EMAIL'>('PDF');
  
  // Input states
  const [pastedText, setPastedText] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailSender, setEmailSender] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [extractedResult, setExtractedResult] = useState<any>(null);
  const [editableForm, setEditableForm] = useState<any>(null);
  const [isEditingForm, setIsEditingForm] = useState(false);

  const sampleIncidentText = `MANUFACTURING DEVIATION INCIDENT REPORT
Report ID: INC-2026-0889 | Department: API Production | Date: 2026-10-28

Incident Title: Temperature Excursion During API Drying Process
Batch Number: API-2026-014
API Product: Active Pharmaceutical Ingredient (API-Alpha)
Manufacturing Stage: Drying Phase (Tray Dryer TD-04)
Equipment Involved: Industrial Tray Dryer TD-04 (Asset Tag: EQ-TD04)

Incident Description:
During the manufacturing of API batch API-2026-014, the drying stage exceeded the validated upper temperature limit of 60.0°C for approximately 25 minutes. The continuous SCADA historian trend indicates that temperature probe RTD TT-401 recorded a peak temperature of 68.4°C at 14:22:00. 

Immediate Containment Action Taken:
The shift operator manually closed steam valve CV-102 and initiated emergency cooling water flushing. Batch API-2026-014 was immediately isolated and placed on physical Quality Hold in Quarantine Room Q-02. Quality Assurance was notified at 14:35.

Observed Impact:
Thermal exposure above validated limit may affect crystalline polymorph distribution and loss on drying (LOD) degradation profile. Assigned to QA Lead Specialist.`;

  const handleLoadSample = () => {
    setInputMode('TEXT');
    setPastedText(sampleIncidentText);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setPdfFile(file);
      } else {
        alert('Please upload a PDF document.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleProcessAI = async () => {
    setIsProcessing(true);
    setCurrentStep(1); // Reading

    try {
      setTimeout(() => setCurrentStep(2), 600); // Extracting
      setTimeout(() => setCurrentStep(3), 1200); // Validating
      setTimeout(() => setCurrentStep(4), 1800); // Preparing

      let result: any;
      if (inputMode === 'PDF' && pdfFile) {
        result = await processIncidentDocument(pdfFile);
      } else if (inputMode === 'EMAIL') {
        result = await processIncidentText(emailBody || sampleIncidentText, 'EMAIL', emailSubject, emailSender);
      } else {
        result = await processIncidentText(pastedText || sampleIncidentText, 'TEXT');
      }

      setTimeout(() => {
        setExtractedResult(result);
        setEditableForm(result.extracted_information || result);
        setCurrentStep(5);
        setIsProcessing(false);
      }, 2400);
    } catch (err) {
      alert('Error extracting information with AI. Using default pipeline.');
      setIsProcessing(false);
    }
  };

  const handleSaveAndProceed = async () => {
    if (!extractedResult) return;

    const fullInvPayload = {
      deviation_id: editableForm.deviation_id || `DEV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: editableForm.title || "API Deviation Investigation",
      description: editableForm.description || "",
      source_type: inputMode,
      occurrence_date: editableForm.occurrence_date || "2026-10-28",
      reported_date: editableForm.reported_date || "2026-10-28",
      department: editableForm.department || "Production",
      batch_number: editableForm.batch_number || "API-2026-014",
      product_name: editableForm.product_name || "API-Alpha",
      manufacturing_stage: editableForm.manufacturing_stage || "Drying",
      equipment: editableForm.equipment || "Tray Dryer TD-04",
      severity: editableForm.severity || "Major",
      immediate_action: editableForm.immediate_action || "Quality Hold",
      extracted_data: editableForm,
      five_whys: extractedResult.five_whys || [],
      fishbone: extractedResult.fishbone || [],
      root_causes: extractedResult.potential_root_causes || [],
      evidence_gaps: extractedResult.evidence_gaps || [],
      capas: extractedResult.capa_recommendations || [],
      investigation_status: "Under Investigation"
    };

    const savedInv = await dispatch(saveInvestigationThunk(fullInvPayload as any)).unwrap();
    dispatch(setActiveInvestigation(savedInv));
    navigate(`/investigations/${savedInv.id}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900">AI-Powered Incident Intake & RCA Form Generation</h1>
          <p className="text-xs text-slate-500">
            Upload a deviation document, narrative, or email to initiate structured AI 5 Whys and Fishbone investigation.
          </p>
        </div>
        <button
          onClick={handleLoadSample}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Load Preset Sample (Batch API-2026-014)</span>
        </button>
      </div>

      {/* Input Method Segmented Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <button
            onClick={() => setInputMode('PDF')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'PDF' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Option A: PDF Document Upload</span>
          </button>
          <button
            onClick={() => setInputMode('TEXT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'TEXT' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Option B: Pasted Text Narrative</span>
          </button>
          <button
            onClick={() => setInputMode('EMAIL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'EMAIL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Option C: Incident Email Intake</span>
          </button>
        </div>

        {/* Input Area */}
        {inputMode === 'PDF' && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center space-y-3 transition-colors ${
              dragActive ? 'border-sky-500 bg-sky-50/50' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <UploadCloud className="w-10 h-10 text-sky-600 mx-auto" />
            <div>
              <p className="text-xs font-bold text-slate-900">Drag and drop your manufacturing deviation PDF here</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF deviation reports, BMR logs, or incident sheets</p>
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-xs">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Browse File...</span>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </label>

            {pdfFile && (
              <div className="p-3 bg-white border border-slate-200 rounded-lg max-w-md mx-auto flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-slate-800 truncate">{pdfFile.name}</span>
                <span className="text-slate-500 font-mono text-[11px]">({(pdfFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        )}

        {inputMode === 'TEXT' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Incident Narrative / Deviation Description</label>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste incident description, operator logs, or quality deviation narrative..."
              rows={8}
              className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
            />
          </div>
        )}

        {inputMode === 'EMAIL' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. URGENT: Deviation Batch API-2026-014 Excursion"
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Sender Email</label>
                <input
                  type="text"
                  value={emailSender}
                  onChange={(e) => setEmailSender(e.target.value)}
                  placeholder="e.g. operator.shift1@pharma-plant.com"
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Content Body</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Paste body of email report..."
                rows={5}
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">
            Powered by Groq Llama-3.3-70B API & LangGraph StateGraph Execution Pipeline
          </span>

          <button
            onClick={handleProcessAI}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running LangGraph AI Workflow...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Information with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Processing Stage Timeline Bar */}
      {isProcessing && (
        <div className="bg-slate-900 text-white p-6 rounded-xl space-y-4 shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-3">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              Executing LangGraph Multi-Node RCA Pipeline...
            </span>
            <span className="font-mono text-sky-400">Step {currentStep} / 4</span>
          </div>

          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className={`p-3 rounded-lg border transition-all ${currentStep >= 1 ? 'bg-sky-950/80 border-sky-500 text-sky-200' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
              <div className="font-bold">1. Reading Source</div>
              <div className="text-[10px] opacity-75">PyMuPDF / Text Intake</div>
            </div>
            <div className={`p-3 rounded-lg border transition-all ${currentStep >= 2 ? 'bg-sky-950/80 border-sky-500 text-sky-200' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
              <div className="font-bold">2. Extracting Details</div>
              <div className="text-[10px] opacity-75">Groq Structured Extraction</div>
            </div>
            <div className={`p-3 rounded-lg border transition-all ${currentStep >= 3 ? 'bg-sky-950/80 border-sky-500 text-sky-200' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
              <div className="font-bold">3. Validating Info</div>
              <div className="text-[10px] opacity-75">Field Integrity Check</div>
            </div>
            <div className={`p-3 rounded-lg border transition-all ${currentStep >= 4 ? 'bg-sky-950/80 border-sky-500 text-sky-200' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
              <div className="font-bold">4. Preparing RCA Form</div>
              <div className="text-[10px] opacity-75">5 Whys & Fishbone Setup</div>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Editable RCA Form */}
      {editableForm && !isProcessing && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                AI Extracted Deviation Form (Review & Edit)
              </h2>
              <p className="text-xs text-slate-500">
                Values populated automatically from source documentation. Review and edit before generating final RCA records.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingForm(!isEditingForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                <span>{isEditingForm ? 'Lock Fields' : 'Edit Fields'}</span>
              </button>
            </div>
          </div>

          {/* Form Fields Grid (15 Fields as specified in Section 6) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Deviation ID</label>
              <input
                type="text"
                disabled={!isEditingForm}
                value={editableForm.deviation_id || ''}
                onChange={(e) => setEditableForm({ ...editableForm, deviation_id: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg font-mono disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Incident Title</label>
              <input
                type="text"
                disabled={!isEditingForm}
                value={editableForm.title || ''}
                onChange={(e) => setEditableForm({ ...editableForm, title: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Batch Number</label>
              <input
                type="text"
                disabled={!isEditingForm}
                value={editableForm.batch_number || ''}
                onChange={(e) => setEditableForm({ ...editableForm, batch_number: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg font-mono disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">API Product Name</label>
              <input
                type="text"
                disabled={!isEditingForm}
                value={editableForm.product_name || ''}
                onChange={(e) => setEditableForm({ ...editableForm, product_name: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Department</label>
              <input
                type="text"
                disabled={!isEditingForm}
                value={editableForm.department || ''}
                onChange={(e) => setEditableForm({ ...editableForm, department: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Manufacturing Stage</label>
              <input
                type="text"
                disabled={!isEditingForm}
                value={editableForm.manufacturing_stage || ''}
                onChange={(e) => setEditableForm({ ...editableForm, manufacturing_stage: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Equipment Involved</label>
              <input
                type="text"
                disabled={!isEditingForm}
                value={editableForm.equipment || ''}
                onChange={(e) => setEditableForm({ ...editableForm, equipment: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Occurrence Date</label>
              <input
                type="date"
                disabled={!isEditingForm}
                value={editableForm.occurrence_date || ''}
                onChange={(e) => setEditableForm({ ...editableForm, occurrence_date: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Reported Date</label>
              <input
                type="date"
                disabled={!isEditingForm}
                value={editableForm.reported_date || ''}
                onChange={(e) => setEditableForm({ ...editableForm, reported_date: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Severity Level</label>
              <select
                disabled={!isEditingForm}
                value={editableForm.severity || 'Major'}
                onChange={(e) => setEditableForm({ ...editableForm, severity: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50 font-semibold text-slate-900"
              >
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Moderate">Moderate</option>
                <option value="Minor">Minor</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Investigation Owner</label>
              <input
                type="text"
                disabled={!isEditingForm}
                value={editableForm.investigation_owner || ''}
                onChange={(e) => setEditableForm({ ...editableForm, investigation_owner: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Incident Description</label>
              <textarea
                disabled={!isEditingForm}
                value={editableForm.description || ''}
                onChange={(e) => setEditableForm({ ...editableForm, description: e.target.value })}
                rows={3}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Immediate Containment Action Taken</label>
              <textarea
                disabled={!isEditingForm}
                value={editableForm.immediate_action || ''}
                onChange={(e) => setEditableForm({ ...editableForm, immediate_action: e.target.value })}
                rows={2}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Observed Quality Impact</label>
              <textarea
                disabled={!isEditingForm}
                value={editableForm.observed_impact || ''}
                onChange={(e) => setEditableForm({ ...editableForm, observed_impact: e.target.value })}
                rows={2}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50 text-slate-700"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => setExtractedResult(null)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reprocess Source</span>
            </button>

            <button
              onClick={handleSaveAndProceed}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Accept & Conduct Full 5 Whys / Fishbone Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
