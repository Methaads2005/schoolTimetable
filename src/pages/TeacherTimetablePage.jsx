import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import TimetableGrid from '../components/timetable/TimetableGrid';
import PrintHeader from '../components/timetable/PrintHeader';
import { UserCheck2, Printer, Calendar, Clock, BookOpen, Layers } from 'lucide-react';

export default function TeacherTimetablePage() {
  const { teachers, currentRole, selectedTeacherId, setSelectedTeacherId, timetable, substitutions } = useSchool();

  const [activeTeacherId, setActiveTeacherId] = useState(
    currentRole === 'teacher' ? selectedTeacherId : (teachers[0]?.id || 'T101')
  );

  const teacher = teachers.find(t => t.id === activeTeacherId) || teachers[0];

  // Calculate teacher stats
  const teacherPeriods = timetable.filter(e => 
    (e.teacherId === activeTeacherId || e.substitutedTeacherId === activeTeacherId) &&
    e.shift === 'regular'
  );

  const mySubstitutions = substitutions.filter(s => s.substituteTeacherId === activeTeacherId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Official Print Header */}
      <PrintHeader
        title={`Faculty Timetable: ${teacher?.name} (${teacher?.department})`}
        subtitle={`Staff ID: ${teacher?.staffId} • Max Periods: ${teacher?.maxPeriodsPerDay}/day`}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            Faculty Individual Timetable
          </h1>
          <p className="text-xs text-slate-500">
            View personalized weekly schedules, room allocations, practical classes, and assigned substitution duties.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Faculty Selector (Only if Admin or Coordinator) */}
          {currentRole !== 'teacher' && (
            <select
              value={activeTeacherId}
              onChange={(e) => setActiveTeacherId(e.target.value)}
              className="text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-indigo-900 shadow-xs focus:ring-2 focus:ring-indigo-500"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.department} - {t.staffId})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Faculty Schedule</span>
          </button>
        </div>
      </div>

      {/* Teacher Profile & Workload Card */}
      {teacher && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-lg flex items-center justify-center">
              {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-slate-900">{teacher.name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-indigo-700">{teacher.department}</span>
                <span>•</span>
                <span className="font-mono text-slate-600 font-semibold">{teacher.staffId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Weekly Assigned:</span>
              <span className="font-bold text-slate-900 text-sm">{teacherPeriods.length} / {teacher.maxPeriodsPerWeek || 24} Periods</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Daily Limit:</span>
              <span className="font-bold text-slate-900 text-sm">Max {teacher.maxPeriodsPerDay || 5} Periods/day</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Substitution Coverage:</span>
              <span className="font-bold text-emerald-700 text-sm">{mySubstitutions.length} Assigned</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid filtered for this teacher */}
      <TimetableGrid
        filterTeacherId={activeTeacherId}
        shift="regular"
      />

    </div>
  );
}
