import React, { useState, useEffect } from 'react';
import { CapaItem, CapaType, CapaStatus } from '../../types';
import { Save, X, AlertTriangle } from 'lucide-react';

interface CapaModalProps {
  capa?: Partial<CapaItem> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (capa: Partial<CapaItem>) => void;
}

export const CapaModal: React.FC<CapaModalProps> = ({ capa, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<CapaItem>>({
    capa_type: 'Corrective',
    description: '',
    justification: '',
    responsible_department: 'Engineering & Maintenance',
    owner: 'QA Manager',
    priority: 'High',
    target_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    verification_method: '',
    effectiveness_criteria: '',
    status: 'Proposed'
  });

  useEffect(() => {
    if (capa) {
      setFormData(capa);
    } else {
      setFormData({
        capa_type: 'Corrective',
        description: '',
        justification: '',
        responsible_department: 'Engineering & Maintenance',
        owner: 'QA Manager',
        priority: 'High',
        target_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        verification_method: '',
        effectiveness_criteria: '',
        status: 'Proposed'
      });
    }
  }, [capa, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {formData.id ? `Edit Action Plan: ${formData.id}` : 'Create New CAPA Recommendation'}
            </h3>
            <p className="text-xs text-slate-500">
              Formulate compliant corrective or preventive actions aligned with investigation findings.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Action Type</label>
              <select
                value={formData.capa_type}
                onChange={(e) => setFormData({ ...formData, capa_type: e.target.value as CapaType })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="Corrective">Corrective Action (Immediate Fix)</option>
                <option value="Preventive">Preventive Action (Recurrence Risk Reduction)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Action Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              placeholder="Detailed description of the corrective or preventive action to be executed..."
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Investigation Justification</label>
            <input
              type="text"
              value={formData.justification || ''}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              placeholder="Why this action addresses the identified root cause..."
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Responsible Dept</label>
              <input
                type="text"
                value={formData.responsible_department || ''}
                onChange={(e) => setFormData({ ...formData, responsible_department: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Suggested Owner</label>
              <input
                type="text"
                value={formData.owner || ''}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Completion Date</label>
              <input
                type="date"
                value={formData.target_date || ''}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Verification Method</label>
              <textarea
                value={formData.verification_method || ''}
                onChange={(e) => setFormData({ ...formData, verification_method: e.target.value })}
                rows={2}
                placeholder="Audit, stroke test, re-qualification protocol..."
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Effectiveness Criteria</label>
              <textarea
                value={formData.effectiveness_criteria || ''}
                onChange={(e) => setFormData({ ...formData, effectiveness_criteria: e.target.value })}
                rows={2}
                placeholder="Zero recurrence across N batches or 30-day monitoring window..."
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Status Lifecycle</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CapaStatus })}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="Proposed">Proposed (AI Recommendation)</option>
              <option value="Under Review">Under Review (QA Review)</option>
              <option value="Approved">Approved (Action Plan Active)</option>
              <option value="In Progress">In Progress (Execution)</option>
              <option value="Completed">Completed (Pending Check)</option>
              <option value="Effectiveness Check">Effectiveness Check (Monitoring)</option>
              <option value="Closed">Closed (Verified Effective)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-700 text-white rounded-lg text-xs font-bold hover:bg-sky-800 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Action Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
