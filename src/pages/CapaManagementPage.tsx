import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loadCapas, saveCapaThunk, deleteCapaThunk } from '../redux/rcaSlice';
import { StatusBadge } from '../components/common/Badge';
import { CapaModal } from '../components/capa/CapaModal';
import { CapaItem } from '../types';
import { 
  CheckSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Layers
} from 'lucide-react';

export const CapaManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { capas } = useAppSelector((state) => state.rca);

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Corrective' | 'Preventive'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCapa, setSelectedCapa] = useState<CapaItem | null>(null);

  useEffect(() => {
    dispatch(loadCapas());
  }, [dispatch]);

  const filteredCapas = capas.filter((c) => {
    const matchesType = typeFilter === 'ALL' || c.capa_type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setSelectedCapa(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (capa: CapaItem) => {
    setSelectedCapa(capa);
    setIsModalOpen(true);
  };

  const handleSave = async (capaData: Partial<CapaItem>) => {
    await dispatch(saveCapaThunk(capaData)).unwrap();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete CAPA record?')) {
      await dispatch(deleteCapaThunk(id)).unwrap();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Corrective & Preventive Action (CAPA) Management</h1>
          <p className="text-xs text-slate-500">
            Remediation plan tracking, department assignments, target dates, and effectiveness monitoring.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create CAPA Item</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter By:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1 rounded text-xs font-semibold ${typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('Corrective')}
              className={`px-3 py-1 rounded text-xs font-semibold ${typeFilter === 'Corrective' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Corrective Actions
            </button>
            <button
              onClick={() => setTypeFilter('Preventive')}
              className={`px-3 py-1 rounded text-xs font-semibold ${typeFilter === 'Preventive' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Preventive Actions
            </button>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-slate-50"
            >
              <option value="ALL">All Statuses</option>
              <option value="Proposed">Proposed</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Effectiveness Check">Effectiveness Check</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="ml-auto font-mono text-xs text-slate-500">
            {filteredCapas.length} CAPA items
          </div>
        </div>
      </div>

      {/* CAPA Workspace Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
              <th className="p-3.5">CAPA ID</th>
              <th className="p-3.5">Type & Priority</th>
              <th className="p-3.5">Description & Justification</th>
              <th className="p-3.5">Department & Owner</th>
              <th className="p-3.5">Target Date</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCapas.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                  No CAPA records match your selection.
                </td>
              </tr>
            ) : (
              filteredCapas.map((capa) => (
                <tr key={capa.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-sky-800">{capa.id}</td>
                  <td className="p-3.5 space-y-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold block w-fit ${
                      capa.capa_type === 'Corrective' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {capa.capa_type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">Priority: {capa.priority}</span>
                  </td>
                  <td className="p-3.5 max-w-sm">
                    <p className="font-bold text-slate-900 leading-snug">{capa.description}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{capa.justification}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800">{capa.owner}</p>
                    <p className="text-[11px] text-slate-500">{capa.responsible_department}</p>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700">{capa.target_date}</td>
                  <td className="p-3.5"><StatusBadge status={capa.status} /></td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(capa)}
                        className="p-1.5 text-sky-700 hover:bg-sky-50 rounded"
                        title="Edit CAPA"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(capa.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete CAPA"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CAPA Modal */}
      <CapaModal
        isOpen={isModalOpen}
        capa={selectedCapa}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};
