import React, { useState } from 'react';
import { FiveWhyItem } from '../../types';
import { useAppDispatch } from '../../redux/hooks';
import { updateFiveWhyStep } from '../../redux/rcaSlice';
import { 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Edit2, 
  Save, 
  RotateCcw,
  Sparkles,
  FileText,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface FiveWhysSectionProps {
  fiveWhys: FiveWhyItem[];
}

export const FiveWhysSection: React.FC<FiveWhysSectionProps> = ({ fiveWhys }) => {
  const dispatch = useAppDispatch();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAnswer, setEditAnswer] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleStartEdit = (index: number, currentAnswer: string, currentNotes: string = '') => {
    setEditingIndex(index);
    setEditAnswer(currentAnswer);
    setEditNotes(currentNotes);
  };

  const handleSaveEdit = (index: number) => {
    dispatch(updateFiveWhyStep({
      index,
      updates: {
        answer: editAnswer,
        reviewer_notes: editNotes
      }
    }));
    setEditingIndex(null);
  };

  const handleToggleVerified = (index: number, currentVerified: boolean = false) => {
    dispatch(updateFiveWhyStep({
      index,
      updates: {
        is_verified: !currentVerified
      }
    }));
  };

  const confidenceBadges: Record<string, string> = {
    'Observed Fact': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Possible Contributing Factor': 'bg-sky-50 text-sky-700 border-sky-200',
    'Potential Root Cause': 'bg-amber-50 text-amber-700 border-amber-200',
    'Confirmed Root Cause': 'bg-purple-50 text-purple-700 border-purple-200 font-semibold'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            Structured 5 Whys Root Cause Chain
          </h3>
          <p className="text-xs text-slate-500">
            Systematic iterative causal investigation following ICH Q9 quality risk management principles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">
            {fiveWhys.filter(f => f.is_verified).length} / {fiveWhys.length} Steps Verified
          </span>
        </div>
      </div>

      {/* 5 Whys Chain */}
      <div className="relative space-y-4 before:absolute before:left-6 before:top-6 before:bottom-6 before:w-0.5 before:bg-slate-200">
        {fiveWhys.map((step, idx) => {
          const isEditing = editingIndex === idx;
          const isVerified = step.is_verified ?? false;

          return (
            <div key={idx} className="relative pl-14 transition-all">
              {/* Node Circle */}
              <div className={`absolute left-0 top-1 w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-xs z-10 transition-colors ${
                isVerified 
                  ? 'bg-emerald-600 border-emerald-700 text-white' 
                  : step.confidence === 'Confirmed Root Cause'
                  ? 'bg-purple-600 border-purple-700 text-white'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}>
                Why #{step.level}
              </div>

              {/* Step Card */}
              <div className={`bg-white border rounded-xl p-4 transition-all ${
                isVerified ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <span className="text-[11px] font-mono text-slate-400 font-medium uppercase tracking-wider">
                      Level {step.level} Question
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {step.question}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[11px] border ${confidenceBadges[step.confidence] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {step.confidence}
                    </span>

                    <button
                      onClick={() => handleToggleVerified(idx, isVerified)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors ${
                        isVerified 
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                      title={isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${isVerified ? 'text-emerald-600 fill-emerald-100' : 'text-slate-400'}`} />
                      <span>{isVerified ? 'Verified' : 'Verify'}</span>
                    </button>
                  </div>
                </div>

                {/* Answer Content */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700">AI Investigation Answer</label>
                        <textarea
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700">Reviewer Quality Notes</label>
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add QA reviewer notes or verification protocol ref..."
                          className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="px-3 py-1 text-xs border border-slate-200 rounded text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="flex items-center gap-1 px-3 py-1 bg-sky-700 text-white rounded text-xs font-semibold hover:bg-sky-800"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Step
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {step.answer}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Evidence: {step.supporting_evidence}</span>
                        </div>

                        <button
                          onClick={() => handleStartEdit(idx, step.answer, step.reviewer_notes)}
                          className="flex items-center gap-1 text-sky-700 hover:text-sky-900 font-medium"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit & Comment</span>
                        </button>
                      </div>

                      {step.reviewer_notes && (
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600 flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800">Reviewer Note: </span>
                            <span>{step.reviewer_notes}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
