import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchInvestigationById, saveInvestigationThunk } from '../redux/rcaSlice';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';
import { FiveWhysSection } from '../components/fivewhys/FiveWhysSection';
import { FishboneDiagram } from '../components/fishbone/FishboneDiagram';
import { CapaModal } from '../components/capa/CapaModal';
import { EvidenceUploadModal } from '../components/evidence/EvidenceUploadModal';
import { EvidenceAttachment, EvidenceGap } from '../types';
import { generateInvestigationPDF } from '../services/pdfReportGenerator';
import { 
  FileText, 
  HelpCircle, 
  Cpu, 
  AlertTriangle, 
  CheckSquare, 
  ShieldCheck, 
  Edit3, 
  Printer, 
  Save, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileSearch,
  MessageSquare,
  Lock,
  Paperclip,
  Download
} from 'lucide-react';

export const InvestigationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { activeInvestigation } = useAppSelector((state) => state.rca);

  const [activeTab, setActiveTab] = useState<'overview' | 'five_whys' | 'fishbone' | 'root_causes' | 'capa' | 'signoff'>('five_whys');
  const [isCapaModalOpen, setIsCapaModalOpen] = useState(false);
  const [editingCapa, setEditingCapa] = useState<any>(null);

  // Evidence upload modal state
  const [activeUploadGap, setActiveUploadGap] = useState<EvidenceGap | null>(null);

  // Quality Review Sign-off modal state
  const [showSignoffModal, setShowSignoffModal] = useState(false);
  const [reviewerName, setReviewerName] = useState('Dr. E. Vance, Lead QA');
  const [signatureId, setSignatureId] = useState(`QA-SIG-${Math.floor(1000 + Math.random() * 9000)}`);
  const [reviewComments, setReviewComments] = useState('All 5 Whys steps verified against batch historian logs. CAPA actions approved for implementation.');

  const inv = activeInvestigation;

  useEffect(() => {
    if (id && (!inv || inv.id !== id)) {
      dispatch(fetchInvestigationById(id));
    }
  }, [id, inv, dispatch]);

  if (!inv) {
    return (
      <div className="p-12 text-center space-y-4">
        <FileSearch className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-sm font-bold text-slate-800">Investigation Record Not Found</h2>
        <button onClick={() => navigate('/investigations')} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">
          Return to Investigations List
        </button>
      </div>
    );
  }

  const handleUpdateEvidenceStatus = (gapId: string, newStatus: any) => {
    if (!inv) return;
    const updatedGaps = (inv.evidence_gaps || []).map(g => g.id === gapId ? { ...g, status: newStatus } : g);
    dispatch(saveInvestigationThunk({ ...inv, evidence_gaps: updatedGaps }));
  };

  const handleUploadAttachment = (gapId: string, attachment: EvidenceAttachment, newStatus: string) => {
    if (!inv) return;
    const updatedGaps = (inv.evidence_gaps || []).map(g => {
      if (g.id === gapId) {
        const existingAtts = g.attachments || [];
        return {
          ...g,
          status: newStatus as any,
          attachments: [...existingAtts, attachment]
        };
      }
      return g;
    });
    dispatch(saveInvestigationThunk({ ...inv, evidence_gaps: updatedGaps }));
  };

  const handleUpdateRootCauseStatus = (rcId: string, newStatus: any) => {
    if (!inv) return;
    const updatedRCs = (inv.root_causes || []).map(r => r.id === rcId ? { ...r, status: newStatus } : r);
    dispatch(saveInvestigationThunk({ ...inv, root_causes: updatedRCs }));
  };

  const handleSaveCapa = (capaData: any) => {
    if (!inv) return;
    const existingCapas = inv.capas || [];
    let updatedCapas;
    if (capaData.id) {
      updatedCapas = existingCapas.map(c => c.id === capaData.id ? capaData : c);
    } else {
      updatedCapas = [...existingCapas, { ...capaData, id: `CAPA-2026-${Math.floor(100 + Math.random() * 900)}` }];
    }
    dispatch(saveInvestigationThunk({ ...inv, capas: updatedCapas }));
  };

  const handleFinalSignoff = async () => {
    if (!inv) return;
    const updated = {
      ...inv,
      investigation_status: 'Completed' as const
    };
    await dispatch(saveInvestigationThunk(updated)).unwrap();
    setShowSignoffModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {inv.deviation_id}
              </span>
              <SeverityBadge severity={inv.severity} />
              <StatusBadge status={inv.investigation_status} />
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono">Batch: {inv.batch_number}</span>
            </div>
            <h1 className="text-base font-extrabold text-slate-900">{inv.title}</h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => generateInvestigationPDF(inv)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Investigation PDF</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print View</span>
            </button>

            <button
              onClick={() => setShowSignoffModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit Quality Sign-Off</span>
            </button>
          </div>
        </div>

        {/* Quick Parameters Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div><span className="font-bold text-slate-800">Product: </span>{inv.product_name}</div>
          <div><span className="font-bold text-slate-800">Department: </span>{inv.department}</div>
          <div><span className="font-bold text-slate-800">Equipment: </span>{inv.equipment}</div>
          <div><span className="font-bold text-slate-800">Occurrence: </span>{inv.occurrence_date}</div>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-3 pt-2 rounded-t-xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'overview' ? 'border-sky-600 text-sky-700 bg-sky-50/40' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Extracted Info</span>
        </button>

        <button
          onClick={() => setActiveTab('five_whys')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'five_whys' ? 'border-sky-600 text-sky-700 bg-sky-50/40' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>5 Whys Analysis</span>
          <span className="text-[10px] font-mono px-1.5 bg-slate-100 rounded text-slate-600">
            {inv.five_whys?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('fishbone')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'fishbone' ? 'border-sky-600 text-sky-700 bg-sky-50/40' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Fishbone (Ishikawa 6M)</span>
        </button>

        <button
          onClick={() => setActiveTab('root_causes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'root_causes' ? 'border-sky-600 text-sky-700 bg-sky-50/40' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Root Causes & Evidence Gaps</span>
          <span className="text-[10px] font-mono px-1.5 bg-amber-100 rounded text-amber-800 font-bold">
            {inv.evidence_gaps?.filter(e => e.status === 'Pending').length || 0} Pending
          </span>
        </button>

        <button
          onClick={() => setActiveTab('capa')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'capa' ? 'border-sky-600 text-sky-700 bg-sky-50/40' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>CAPA Recommendations</span>
          <span className="text-[10px] font-mono px-1.5 bg-sky-100 rounded text-sky-800">
            {inv.capas?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('signoff')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'signoff' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Final QA Sign-Off</span>
        </button>
      </div>

      {/* Tab 1: Extracted Info & Overview */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
            Incident Source Narrative & Containment Action
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Incident Narrative</label>
                <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono mt-1">
                  {inv.description}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Immediate Containment Action</label>
                <p className="text-xs text-slate-800 leading-relaxed bg-amber-50/60 p-3 rounded-lg border border-amber-200 mt-1">
                  {inv.immediate_action}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Observed Quality Impact</label>
                <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1">
                  {inv.extracted_data?.observed_impact || inv.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-bold block">Source Document:</span>
                  <span className="font-mono text-slate-800">{inv.source_type} Upload</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-bold block">Assigned QA Owner:</span>
                  <span className="text-slate-800 font-semibold">{inv.extracted_data?.investigation_owner || 'QA Manager'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 5 Whys Analysis */}
      {activeTab === 'five_whys' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <FiveWhysSection fiveWhys={inv.five_whys || []} />
        </div>
      )}

      {/* Tab 3: Fishbone Diagram */}
      {activeTab === 'fishbone' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <FishboneDiagram categories={inv.fishbone || []} />
        </div>
      )}

      {/* Tab 4: Root Causes & Evidence Gap Checklist */}
      {activeTab === 'root_causes' && (
        <div className="space-y-6">
          {/* Potential Root Causes Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Potential Root Cause Hypotheses</h3>
                <p className="text-xs text-slate-500">
                  Root cause candidates require formal QA verification before status update.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(inv.root_causes || []).map((rc) => (
                <div key={rc.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                      {rc.id}
                    </span>
                    <select
                      value={rc.status}
                      onChange={(e) => handleUpdateRootCauseStatus(rc.id, e.target.value)}
                      className="text-xs font-bold p-1 border border-slate-300 rounded bg-white"
                    >
                      <option value="AI Suggested">AI Suggested</option>
                      <option value="Under Verification">Under Verification</option>
                      <option value="Verified">Verified</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <p className="text-xs font-bold text-slate-900">{rc.description}</p>

                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div><span className="font-bold text-slate-700">Category: </span>{rc.category}</div>
                    <div><span className="font-bold text-slate-700">Supporting Evidence: </span>{rc.supporting_evidence}</div>
                    <div><span className="font-bold text-slate-700">Verification Protocol: </span>{rc.verification_method}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Evidence Gap Checklist (Section 11 Requirement) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Evidence Gap Analysis Checklist</h3>
                <p className="text-xs text-slate-500">
                  Identified missing documentation required to confirm potential root causes.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                    <th className="p-3">Required Document / Evidence</th>
                    <th className="p-3">Evidence Category</th>
                    <th className="p-3">Reason Required</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Collection Status</th>
                    <th className="p-3 text-right">Attached Files & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(inv.evidence_gaps || []).map((gap) => (
                    <tr key={gap.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{gap.missing_evidence}</td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{gap.evidence_category}</td>
                      <td className="p-3 text-slate-600 max-w-xs">{gap.reason_required}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          gap.priority === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {gap.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={gap.status}
                          onChange={(e) => handleUpdateEvidenceStatus(gap.id, e.target.value)}
                          className="p-1 border border-slate-300 rounded text-xs font-semibold bg-white"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Requested">Requested</option>
                          <option value="Received">Received</option>
                          <option value="Reviewed">Reviewed</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {gap.attachments && gap.attachments.length > 0 && (
                            <div className="flex flex-wrap items-center justify-end gap-1">
                              {gap.attachments.map((att) => (
                                <a
                                  key={att.id}
                                  href={att.data_url || '#'}
                                  download={att.filename}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded text-[10px] font-mono hover:bg-sky-100"
                                  title={`${att.filename} (${(att.file_size / 1024).toFixed(1)} KB)`}
                                >
                                  <Paperclip className="w-3 h-3 text-sky-600" />
                                  <span className="truncate max-w-[100px]">{att.filename}</span>
                                </a>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => setActiveUploadGap(gap)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-[11px] font-bold transition-colors"
                          >
                            <Paperclip className="w-3 h-3 text-slate-600" />
                            <span>{gap.attachments?.length ? 'Add File' : 'Attach File'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: CAPA Recommendations */}
      {activeTab === 'capa' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Corrective & Preventive Action (CAPA) Plan</h3>
              <p className="text-xs text-slate-500">
                Action items created to remediate root causes and prevent recurrence.
              </p>
            </div>
            <button
              onClick={() => { setEditingCapa(null); setIsCapaModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-bold hover:bg-sky-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add CAPA Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {(inv.capas || []).map((capa) => (
              <div key={capa.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                      {capa.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      capa.capa_type === 'Corrective' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {capa.capa_type} Action
                    </span>
                    <StatusBadge status={capa.status} />
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Target: {capa.target_date}</span>
                </div>

                <p className="text-xs font-bold text-slate-900">{capa.description}</p>
                <p className="text-xs text-slate-600">Justification: {capa.justification}</p>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <div>Owner: <span className="font-bold text-slate-700">{capa.owner} ({capa.responsible_department})</span></div>
                  <button
                    onClick={() => { setEditingCapa(capa); setIsCapaModalOpen(true); }}
                    className="text-sky-700 hover:text-sky-900 font-bold"
                  >
                    Edit Action Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Final QA Review & Sign-Off */}
      {activeTab === 'signoff' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Quality Assurance Investigation Final Review
            </h3>
            <p className="text-xs text-slate-500">
              Verify completion of 5 Whys, Fishbone, Evidence Checklist, and CAPA recommendations.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-800">Investigation Status:</span>
              <StatusBadge status={inv.investigation_status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">5 Whys Causal Verification:</span>
              <span className="font-mono text-emerald-700 font-bold">
                {inv.five_whys?.filter(f => f.is_verified).length} / {inv.five_whys?.length} Verified
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Evidence Gap Collection:</span>
              <span className="font-mono text-sky-700 font-bold">
                {inv.evidence_gaps?.filter(e => e.status === 'Reviewed').length} / {inv.evidence_gaps?.length} Reviewed
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">CAPA Plan Formulation:</span>
              <span className="font-mono text-purple-700 font-bold">{inv.capas?.length} Actions Formulated</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowSignoffModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Complete Quality Sign-Off & Close Investigation</span>
            </button>
          </div>
        </div>
      )}

      {/* Evidence Upload Modal */}
      <EvidenceUploadModal
        isOpen={!!activeUploadGap}
        evidenceGap={activeUploadGap}
        onClose={() => setActiveUploadGap(null)}
        onUpload={handleUploadAttachment}
      />

      {/* CAPA Modal */}
      <CapaModal
        isOpen={isCapaModalOpen}
        capa={editingCapa}
        onClose={() => setIsCapaModalOpen(false)}
        onSave={handleSaveCapa}
      />

      {/* QA Sign-off Modal */}
      {showSignoffModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Quality Assurance Review Approval
              </h3>
              <button onClick={() => setShowSignoffModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">QA Reviewer Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Digital Signature Key ID</label>
                <input
                  type="text"
                  value={signatureId}
                  onChange={(e) => setSignatureId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">QA Reviewer Comments</label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button onClick={() => setShowSignoffModal(false)} className="px-3 py-1.5 border border-slate-200 rounded text-xs">
                Cancel
              </button>
              <button onClick={handleFinalSignoff} className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded text-xs shadow-xs">
                Approve & Complete Sign-off
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
