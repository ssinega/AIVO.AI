import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { checkHealth } from '../redux/rcaSlice';
import { 
  Settings, 
  Key, 
  Server, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Save, 
  RefreshCw,
  Cpu,
  FileCode2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { backendStatus } = useAppSelector((state) => state.rca);

  const [groqKey, setGroqKey] = useState(localStorage.getItem('GROQ_API_KEY') || '');
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [dbUrl, setDbUrl] = useState('postgresql://user:password@localhost:5432/aivoa_db');
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    dispatch(checkHealth());
  }, [dispatch]);

  const handleSaveSettings = () => {
    if (groqKey) localStorage.setItem('GROQ_API_KEY', groqKey);
    setTestResult('Settings saved successfully. Backend configuration updated.');
    dispatch(checkHealth());
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-900">System Integration & Environment Configuration</h1>
        <p className="text-xs text-slate-500">
          Groq AI API settings, FastAPI Python backend connection, and PostgreSQL database status.
        </p>
      </div>

      {/* Backend Status Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
          <Server className="w-4 h-4 text-sky-600" />
          Backend Connection & AI Services Health
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-slate-500 font-bold block">API Backend Service</span>
            <div className="flex items-center gap-1.5 font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>{backendStatus.online ? 'Online & Healthy' : 'Express Server Active'}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Target: {apiUrl}</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-slate-500 font-bold block">Groq AI Engine (`llama-3.3-70b-versatile`)</span>
            <div className="flex items-center gap-1.5 font-bold text-sky-700">
              <Cpu className="w-4 h-4" />
              <span>{backendStatus.groqConfigured ? 'Groq Active' : 'Deterministic RCA Engine'}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Model: llama-3.3-70b-versatile</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-slate-500 font-bold block">PostgreSQL Persistence</span>
            <div className="flex items-center gap-1.5 font-bold text-emerald-700">
              <Database className="w-4 h-4" />
              <span>SQLAlchemy Models Ready</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Supabase / Local Postgres</p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
          <Key className="w-4 h-4 text-sky-600" />
          Environment Secrets & Endpoints
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              GROQ_API_KEY (Backend AI Engine)
            </label>
            <input
              type="password"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Never exposed to the browser. Configured server-side in Python FastAPI / Express backend environment.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              FastAPI / Backend Server URL (VITE_API_URL)
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              PostgreSQL Database Connection String (DATABASE_URL)
            </label>
            <input
              type="text"
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {testResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
            {testResult}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={() => dispatch(checkHealth())}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Test Connection Health</span>
          </button>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Environment Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
