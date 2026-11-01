import React, { useState } from 'react';
import { FishboneCategory, FishboneFactor } from '../../types';
import { 
  Users, 
  Cpu, 
  FileCode2, 
  Box, 
  Gauge, 
  Wind, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface FishboneDiagramProps {
  categories: FishboneCategory[];
}

export const FishboneDiagram: React.FC<FishboneDiagramProps> = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Machine');
  const [activeFactorModal, setActiveFactorModal] = useState<{ category: string; factor: FishboneFactor } | null>(null);

  const categoryIcons: Record<string, any> = {
    Manpower: Users,
    Machine: Cpu,
    Method: FileCode2,
    Material: Box,
    Measurement: Gauge,
    Environment: Wind
  };

  const activeCategoryData = categories.find(c => c.category === selectedCategory) || categories[0];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-600" />
          Ishikawa (Fishbone 6M) Pharmaceutical Cause-and-Effect Analysis
        </h3>
        <p className="text-xs text-slate-500">
          Categorized breakdown across the six core pharmaceutical API manufacturing vectors.
        </p>
      </div>

      {/* Visual Fishbone SVG Diagram */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm overflow-x-auto relative">
        <div className="min-w-[700px] relative">
          {/* Main Spine */}
          <div className="h-1 bg-sky-400 w-full top-1/2 relative flex items-center justify-end">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-[16px] border-l-sky-400 translate-x-3" />
          </div>

          {/* Problem Head */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-sky-950 border border-sky-500/60 text-sky-200 p-3 rounded-lg text-xs font-bold w-44 text-center shadow-lg">
            Deviating Incident: API Thermal Excursion
          </div>

          {/* 6 Rib Categories Grid */}
          <div className="grid grid-cols-3 gap-8 py-8 relative">
            {categories.map((cat, i) => {
              const Icon = categoryIcons[cat.category] || Box;
              const isSelected = selectedCategory === cat.category;
              const isTopRow = i < 3;

              return (
                <div
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-sky-900/80 border-sky-400 text-white shadow-md'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-300' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold tracking-wide">{cat.category}</span>
                    <span className="ml-auto text-[10px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">
                      {cat.factors.length} factors
                    </span>
                  </div>

                  <ul className="space-y-1">
                    {cat.factors.slice(0, 2).map((factor, fIdx) => (
                      <li key={fIdx} className="text-[11px] text-slate-300 truncate flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                        <span className="truncate">{factor.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Segmented Category Selection & Factor Details Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.category] || Box;
            const isSelected = selectedCategory === cat.category;
            return (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.category}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-200/80 rounded-full font-mono text-slate-600">
                  {cat.factors.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Category Factors List */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider text-slate-500 font-mono">
            {activeCategoryData.category} Contributing Factor Analysis
          </h4>

          {activeCategoryData.factors.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-lg">
              No contributing factors identified in this category.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeCategoryData.factors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3.5 border border-slate-200 rounded-lg hover:border-slate-300 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 leading-tight">
                      {factor.name}
                    </h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                      {factor.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {factor.description}
                  </p>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono text-slate-500 truncate max-w-[200px]">
                      Source Evidence: {factor.evidence}
                    </span>
                    <button
                      onClick={() => setActiveFactorModal({ category: activeCategoryData.category, factor })}
                      className="text-sky-700 hover:text-sky-900 font-medium shrink-0"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Factor Detail Modal */}
      {activeFactorModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider font-mono">
                {activeFactorModal.category} Factor Breakdown
              </span>
              <button
                onClick={() => setActiveFactorModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{activeFactorModal.factor.name}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activeFactorModal.factor.description}</p>
            </div>
            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-slate-700">Supporting Evidence: </span>
                <span className="text-slate-600 font-mono">{activeFactorModal.factor.evidence}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Current Status: </span>
                <span className="text-sky-700 font-semibold">{activeFactorModal.factor.status}</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setActiveFactorModal(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
