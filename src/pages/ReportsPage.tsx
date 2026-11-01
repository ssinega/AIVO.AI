import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loadMetrics, loadInvestigations } from '../redux/rcaSlice';
import { 
  BarChart3, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText,
  PieChart as PieIcon,
  Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  LineChart,
  Line,
  Cell
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { metrics, investigations } = useAppSelector((state) => state.rca);

  useEffect(() => {
    dispatch(loadMetrics());
    dispatch(loadInvestigations());
  }, [dispatch]);

  const severityData = [
    { name: 'Critical', count: 1, color: '#dc2626' },
    { name: 'Major', count: 5, color: '#f59e0b' },
    { name: 'Moderate', count: 6, color: '#0284c7' },
    { name: 'Minor', count: 3, color: '#10b981' }
  ];

  const handleExportCSV = () => {
    const headers = ['Deviation ID', 'Title', 'Product', 'Batch', 'Department', 'Severity', 'Status', 'Date'];
    const rows = investigations.map(i => [
      i.deviation_id,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.product_name}"`,
      i.batch_number,
      `"${i.department}"`,
      i.severity,
      i.investigation_status,
      i.occurrence_date
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aivoa_quality_investigations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Quality Compliance & Analytical Reports</h1>
          <p className="text-xs text-slate-500">
            Executive summaries, deviation category metrics, and GxP regulatory compliance statistics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV Report</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Executive Summary</span>
          </button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase font-mono">Investigation Resolution Rate</span>
          <p className="text-2xl font-extrabold text-emerald-600 font-mono">84.2%</p>
          <p className="text-[11px] text-slate-400">Target: ≥ 80% within 30 days</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase font-mono">CAPA On-Time Completion</span>
          <p className="text-2xl font-extrabold text-sky-600 font-mono">92.0%</p>
          <p className="text-[11px] text-slate-400">Target: ≥ 90% target compliance</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase font-mono">Mean Time to Closure (MTTC)</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">14.5 Days</p>
          <p className="text-[11px] text-slate-400">Regulatory cap: 30 Days</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase font-mono">Root Cause Verification Ratio</span>
          <p className="text-2xl font-extrabold text-purple-600 font-mono">96.5%</p>
          <p className="text-[11px] text-slate-400">5 Whys verified by QA</p>
        </div>
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Deviation Category Distribution</h3>
            <BarChart3 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.category_distribution || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" width={140} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Severity Level Breakdown</h3>
            <PieIcon className="w-4 h-4 text-sky-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
