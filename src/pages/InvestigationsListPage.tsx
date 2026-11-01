import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loadInvestigations, setActiveInvestigation, deleteInvestigationThunk } from '../redux/rcaSlice';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';
import { 
  FileSearch, 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  Filter, 
  Calendar,
  Building2,
  CheckCircle2
} from 'lucide-react';

export const InvestigationsListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { investigations, searchQuery } = useAppSelector((state) => state.rca);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loadInvestigations());
  }, [dispatch]);

  const filteredInvestigations = investigations.filter((inv) => {
    const matchesSearch = 
      !searchQuery ||
      inv.deviation_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.product_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inv.investigation_status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || inv.severity === severityFilter;
    const matchesDept = deptFilter === 'ALL' || inv.department === deptFilter;

    return matchesSearch && matchesStatus && matchesSeverity && matchesDept;
  });

  const handleOpen = (inv: any) => {
    dispatch(setActiveInvestigation(inv));
    navigate(`/investigations/${inv.id}`);
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteInvestigationThunk(id)).unwrap();
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Deviation Investigations Management</h1>
          <p className="text-xs text-slate-500">
            Searchable log of pharmaceutical manufacturing deviations and RCA records persisted in PostgreSQL database.
          </p>
        </div>
        <button
          onClick={() => navigate('/investigations/new')}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New RCA Investigation</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters:</span>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-slate-50"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Under Quality Review">Under Quality Review</option>
              <option value="Completed">Completed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-slate-50"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Moderate">Moderate</option>
              <option value="Minor">Minor</option>
            </select>
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-slate-50"
            >
              <option value="ALL">All Departments</option>
              <option value="Production - API Synthesis">Production - API Synthesis</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Facilities & Maintenance">Facilities & Maintenance</option>
            </select>
          </div>

          <div className="ml-auto text-xs text-slate-500 font-mono">
            Showing {filteredInvestigations.length} of {investigations.length} records
          </div>
        </div>
      </div>

      {/* Investigations Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
              <th className="p-3.5">Deviation ID</th>
              <th className="p-3.5">Title & Product</th>
              <th className="p-3.5">Batch Number</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Severity</th>
              <th className="p-3.5">Investigation Status</th>
              <th className="p-3.5">Created Date</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvestigations.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                  No investigation records match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredInvestigations.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{inv.deviation_id}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-900">{inv.title}</p>
                    <p className="text-[11px] text-slate-500">{inv.product_name}</p>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700">{inv.batch_number}</td>
                  <td className="p-3.5 text-slate-600">{inv.department}</td>
                  <td className="p-3.5"><SeverityBadge severity={inv.severity} /></td>
                  <td className="p-3.5"><StatusBadge status={inv.investigation_status} /></td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '2026-10-28'}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpen(inv)}
                        className="p-1.5 text-sky-700 hover:bg-sky-50 rounded"
                        title="View Investigation Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(inv.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Record"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">Confirm Record Deletion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete investigation record <span className="font-mono font-bold">{deleteConfirmId}</span>? This operation cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 bg-rose-600 text-white rounded text-xs font-bold"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
