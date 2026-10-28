import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  UserCheck, 
  Users, 
  RotateCcw,
  Sparkles,
  School
} from 'lucide-react';

export default function Navbar() {
  const { 
    schoolInfo, 
    currentRole, 
    setCurrentRole, 
    teachers, 
    selectedTeacherId, 
    setSelectedTeacherId, 
    validation, 
    setIsConflictModalOpen,
    resetDatabase,
    setActiveTab
  } = useSchool();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-lg text-slate-900 tracking-tight">
                  EduSchedule <span className="text-indigo-600 font-extrabold">PRO</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  AY {schoolInfo.academicYear || '2026-27'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[240px] sm:max-w-xs">
                {schoolInfo.name || 'School Timetable System'}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Conflict Detector Pill */}
            <button
              onClick={() => setIsConflictModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                validation.errorsCount > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 animate-pulse'
                  : validation.warningsCount > 0
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Click to inspect timetable conflicts"
            >
              {validation.errorsCount > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{validation.errorsCount} Clash{validation.errorsCount > 1 ? 'es' : ''}</span>
                </>
              ) : validation.warningsCount > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{validation.warningsCount} Notice{validation.warningsCount > 1 ? 's' : ''}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>All Clear (0 Conflicts)</span>
                </>
              )}
            </button>

            {/* Quick Generator Shortcut */}
            <button
              onClick={() => setActiveTab('auto-generator')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-xs hover:from-indigo-600 hover:to-indigo-700 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Auto Split & Allocate</span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setCurrentRole('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'admin'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>

              <button
                onClick={() => {
                  setCurrentRole('teacher');
                  setActiveTab('teacher-timetable');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'teacher'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Teacher</span>
              </button>

              <button
                onClick={() => setCurrentRole('coordinator')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'coordinator'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Coordinator</span>
              </button>
            </div>

            {/* If Teacher Role active, select which teacher is logged in */}
            {currentRole === 'teacher' && (
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="bg-white border border-indigo-200 text-indigo-800 text-xs font-medium rounded-lg px-2 py-1.5 shadow-xs focus:ring-2 focus:ring-indigo-500"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.department})
                  </option>
                ))}
              </select>
            )}

            {/* Reset to sample data */}
            <button
              onClick={() => {
                if (window.confirm('Reset all timetables and data to default sample school configuration?')) {
                  resetDatabase();
                }
              }}
              title="Reset Sample Data"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
