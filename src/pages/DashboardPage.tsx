import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loadMetrics, loadInvestigations, setActiveInvestigation } from '../redux/rcaSlice';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';
import { 
  FileSearch, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Layers,
  Calendar,
  Building2,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  CartesianGrid 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { metrics, investigations } = useAppSelector((state) => state.rca);

  useEffect(() => {
    dispatch(loadMetrics());
    dispatch(loadInvestigations());
  }, [dispatch]);

  const stats = [
    { label: 'Total Investigations', value: metrics?.total_investigations ?? investigations.length ?? 15, icon: FileSearch, color: 'text-slate-900', bg: 'bg-slate-100' },
    { label: 'Open Investigations', value: metrics?.open_investigations ?? 2, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Under Investigation', value: metrics?.under_investigation ?? 3, icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Completed / Closed', value: metrics?.completed_investigations ?? 10, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending CAPAs', value: metrics?.pending_capas ?? 8, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Overdue CAPAs', value: metrics?.overdue_capas ?? 1, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const handleSelectInv = (inv: any) => {
    dispatch(setActiveInvestigation(inv));
    navigate(`/investigations/${inv.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Active Pharmaceutical Ingredients (API) Quality Operations</h1>
          <p className="text-xs text-slate-300">
            AI-Assisted Investigation Pipeline following ICH Q9 Quality Risk Management & ICH Q10 Pharmaceutical Quality System.
          </p>
        </div>
        <button
          onClick={() => navigate('/investigations/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Deviation Investigation</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 hover:border-slate-300 transition-all shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">{stat.label}</span>
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Monthly Deviation Trend</h3>
              <p className="text-[11px] text-slate-500">Total reported vs closed investigations</p>
            </div>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.monthly_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="investigations" stroke="#0284c7" strokeWidth={2.5} name="Reported" />
                <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2.5} name="Closed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Investigation Status Breakdown</h3>
              <p className="text-[11px] text-slate-500">Distribution across QA workflow stages</p>
            </div>
            <PieChartIcon className="w-4 h-4 text-sky-600" />
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.status_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(metrics?.status_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Investigations Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Recent Deviation Investigations</h3>
            <p className="text-[11px] text-slate-500">Click any row to open full 5 Whys, Fishbone, & CAPA analysis</p>
          </div>
          <button
            onClick={() => navigate('/investigations')}
            className="flex items-center gap-1 text-xs text-sky-700 font-semibold hover:text-sky-900"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                <th className="p-3">Deviation ID</th>
                <th className="p-3">Title & API Product</th>
                <th className="p-3">Batch No.</th>
                <th className="p-3">Department</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {investigations.slice(0, 5).map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => handleSelectInv(inv)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-slate-900">{inv.deviation_id}</td>
                  <td className="p-3">
                    <p className="font-semibold text-slate-900">{inv.title}</p>
                    <p className="text-[11px] text-slate-500">{inv.product_name}</p>
                  </td>
                  <td className="p-3 font-mono text-slate-700">{inv.batch_number}</td>
                  <td className="p-3 text-slate-600">{inv.department}</td>
                  <td className="p-3"><SeverityBadge severity={inv.severity} /></td>
                  <td className="p-3"><StatusBadge status={inv.investigation_status} /></td>
                  <td className="p-3 text-right">
                    <button className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold hover:bg-slate-200">
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
