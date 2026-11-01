import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSearch, 
  PlusCircle, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  Dna,
  FileCheck2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Investigations', path: '/investigations', icon: FileSearch },
    { label: 'New Investigation', path: '/investigations/new', icon: PlusCircle },
    { label: 'CAPA Management', path: '/capa', icon: CheckSquare },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 z-40 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-900/30">
            <Dna className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">AIVOA</span>
              <span className="text-xs font-bold text-sky-400 bg-sky-950/80 border border-sky-800/60 px-1.5 py-0.2 rounded font-mono">.AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Intelligent Quality Investigation</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600/90 text-white font-semibold shadow-sm shadow-sky-900/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Domain</span>
            <span className="text-sky-300 font-semibold">Pharma API</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Standard</span>
            <span className="text-emerald-400 font-mono text-[10px]">ICH Q9 / Q10</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Methodology</span>
            <span className="text-slate-300">5 Whys + 6M</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
