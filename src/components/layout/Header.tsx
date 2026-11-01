import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setSearchQuery, loadInvestigations } from '../../redux/rcaSlice';
import { 
  Search, 
  Bell, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  FileText,
  User,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { searchQuery, backendStatus, investigations } = useAppSelector((state) => state.rca);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingReviewCount = investigations.filter(i => i.investigation_status === 'Under Quality Review').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 shadow-xs">
      {/* Zone 1: Contextual Breadcrumb & System Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-slate-900 font-semibold">Quality Assurance</span>
          <span className="text-slate-300">/</span>
          <span>Pharma API Manufacturing Investigation Platform</span>
        </div>

        {/* Backend Status indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs">
          <Server className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-600 font-mono text-[11px]">
            {backendStatus.online ? 'Backend Connected' : 'Offline Mode'}
          </span>
          <span className={`w-2 h-2 rounded-full ${backendStatus.groqConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`} title={backendStatus.groqConfigured ? 'Groq AI Model Active' : 'Deterministic AI Model Active'} />
          <span className="text-slate-500 text-[11px]">
            {backendStatus.groqConfigured ? 'Groq Llama-3.3' : 'RCA AI Engine'}
          </span>
        </div>
      </div>

      {/* Zone 2: Global Search */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search deviation ID, batch number, equipment, root cause..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* New Investigation Button */}
        <button
          onClick={() => navigate('/investigations/new')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Investigation</span>
        </button>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingReviewCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-xs font-bold text-slate-900">QA Notifications</span>
                <span className="text-[11px] text-slate-500">{pendingReviewCount} pending</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-900">DEV-2026-0089 Requires Sign-off</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">Temperature excursion investigation completed and awaiting QA Manager approval.</p>
                  </div>
                </div>
                <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-lg flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-sky-900">AI Root Cause Suggestion Ready</p>
                    <p className="text-[11px] text-sky-700 mt-0.5">5 Whys analysis generated 2 verified causal steps for Tray Dryer TD-04.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
            QA
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">Dr. E. Vance</p>
            <p className="text-[10px] text-slate-500 leading-tight">Lead QA Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};
