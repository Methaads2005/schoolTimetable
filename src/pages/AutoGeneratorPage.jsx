import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { api } from '../api/client';
import TimetableGrid from '../components/timetable/TimetableGrid';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Save, 
  Lock, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  Check
} from 'lucide-react';

export default function AutoGeneratorPage() {
  const { classes, refreshData, showToast, setActiveTab } = useSchool();

  const [preserveLocked, setPreserveLocked] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [previewClass, setPreviewClass] = useState('10-A');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleRunGenerator = async () => {
    setIsGenerating(true);
    setGenerationResult(null);

    try {
      // Simulate realistic computational solving step for visual feedback
      await new Promise(r => setTimeout(r, 600));

      const res = await api.generateTimetable({
        preserveLocked,
        applyDirectly: false
      });

      setGenerationResult(res);
      showToast('Timetable generated and ready for review!', 'success');
    } catch (err) {
      showToast('Error generating timetable', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAndApply = async () => {
    if (!generationResult?.generatedTimetable) return;

    try {
      await api.saveTimetableBulk(generationResult.generatedTimetable);
      showToast('Approved generated timetable published successfully!', 'success');
      setIsConfirmModalOpen(false);
      await refreshData();
      setActiveTab('timetable-editor');
    } catch (err) {
      showToast('Error saving approved timetable', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
            <span>Automatic Timetable Generator & Staff Allocator</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-700">
              Core Engine
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Constraint satisfaction engine with period-splitting heuristics, clash avoidance, and laboratory grouping.
          </p>
        </div>
      </div>

      {/* Generator Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="font-heading font-bold text-base text-slate-900">
              Solver Configuration & Constraints
            </h2>
            <p className="text-xs text-slate-500">
              The engine automatically splits weekly quotas across Monday–Saturday, assigns qualified staff, and locks double periods for practicals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={preserveLocked}
                onChange={(e) => setPreserveLocked(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Preserve Locked Slots</span>
            </label>

            <button
              onClick={handleRunGenerator}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md ${
                isGenerating
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-100'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Optimal Schedule...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Generate Full Timetable</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Constraint Features Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Even Day Distribution</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Subjects with 6 periods/week split evenly 1 per day across Monday–Saturday.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero Double-Booking</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Strictly prevents faculty or classes from being scheduled in multiple places at once.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Consecutive Lab Blocks</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Physics, Chemistry, and CS Labs are allocated in 2-period contiguous blocks.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Workload Limits</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Honors daily max (5/day) and weekly max (24/week) limits to avoid teacher burnout.
            </p>
          </div>
        </div>
      </div>

      {/* Generated Result Preview Section */}
      {generationResult && (
        <div className="space-y-5 animate-fadeIn">
          
          {/* Status & Review Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  Timetable Generated Successfully!
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>Assigned: <strong className="text-slate-800">{generationResult.totalAssignedPeriods}</strong> slots</span>
                  <span>•</span>
                  <span>
                    Validation:{' '}
                    <strong className={generationResult.validation?.errorsCount === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {generationResult.validation?.errorsCount === 0 ? '0 Clashes (Passed)' : `${generationResult.validation.errorsCount} Clashes`}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Review & Approve Timetable</span>
              </button>
            </div>
          </div>

          {/* Preview Grid with Class Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span className="font-heading font-bold text-sm text-slate-900">
                  Preview Generated Schedule: Class {previewClass}
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {classes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setPreviewClass(c.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      previewClass === c.name
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Static / Preview Grid */}
            <TimetableGrid
              filterClassId={previewClass}
              readOnly={true}
            />
          </div>

        </div>
      )}

      {/* Confirmation Modal to prevent accidental overwrite (Rule #5 & #17) */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                Confirm Timetable Overwrite
              </h3>
              <p className="text-xs text-slate-500">
                This will save the generated schedule into the master database. Any unlocked manual edits will be updated with the newly optimized schedule.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span>Total Periods:</span>
                <strong className="text-slate-900">{generationResult?.totalAssignedPeriods}</strong>
              </div>
              <div className="flex justify-between">
                <span>Preserve Locked Slots:</span>
                <strong className="text-emerald-700">{preserveLocked ? 'Enabled' : 'Disabled'}</strong>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAndApply}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm"
              >
                Yes, Publish Timetable
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
