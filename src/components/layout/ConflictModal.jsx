import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight,
  ExternalLink 
} from 'lucide-react';

export default function ConflictModal() {
  const { isConflictModalOpen, setIsConflictModalOpen, validation, setActiveTab } = useSchool();

  if (!isConflictModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              validation.errorsCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {validation.errorsCount > 0 ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-slate-900">
                Timetable Conflict & Validation Diagnostic
              </h2>
              <p className="text-xs text-slate-500">
                {validation.totalConflicts === 0 
                  ? 'No scheduling clashes found across regular periods, shifts, and laboratories.'
                  : `Detected ${validation.errorsCount} critical clash(es) and ${validation.warningsCount} notice(s).`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConflictModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {validation.totalConflicts === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-800 text-base">Perfect Schedule! No Conflicts</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All teacher allocations, laboratory sessions, weekly period requirements, and class timetables are in full harmony with school constraints.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {validation.conflicts.map((c, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    c.severity === 'error'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
                      c.severity === 'error' 
                        ? 'bg-rose-200 text-rose-800' 
                        : 'bg-amber-200 text-amber-800'
                    }`}>
                      <AlertTriangle className="w-3 h-3" />
                      {c.type.replace(/_/g, ' ')}
                    </span>
                    {c.day && c.period && (
                      <span className="font-semibold text-slate-600 text-[11px]">
                        {c.day} • Period {c.period}
                      </span>
                    )}
                  </div>

                  <p className="font-medium text-slate-800 text-xs pt-1">
                    {c.message}
                  </p>

                  {c.suggestion && (
                    <div className="pt-1 flex items-start gap-1 text-[11px] text-slate-600">
                      <span className="font-semibold text-indigo-600">Action:</span>
                      <span>{c.suggestion}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Real-time validation engine active
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsConflictModalOpen(false);
                setActiveTab('substitutions');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-all"
            >
              Substitution Manager
            </button>
            <button
              onClick={() => {
                setIsConflictModalOpen(false);
                setActiveTab('timetable-editor');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-xs"
            >
              <span>Open Grid Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
