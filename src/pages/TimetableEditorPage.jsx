import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import TimetableGrid from '../components/timetable/TimetableGrid';
import PrintHeader from '../components/timetable/PrintHeader';
import { 
  TableProperties, 
  Filter, 
  Printer, 
  Copy, 
  Lock, 
  Sparkles, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export default function TimetableEditorPage() {
  const { classes, teachers, laboratories, setActiveTab, validation, setIsConflictModalOpen } = useSchool();

  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedShift, setSelectedShift] = useState('regular');
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' | 'daily'
  const [selectedDay, setSelectedDay] = useState('Monday');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Official Print Header */}
      <PrintHeader 
        title={`Class ${selectedClass} Master Weekly Timetable`} 
        subtitle="Approved Academic Schedule" 
      />

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            Manual Timetable Grid & Editor
          </h1>
          <p className="text-xs text-slate-500">
            Click any cell to reassign subjects, faculty, laboratory rooms, or lock slots against automated updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {validation.errorsCount > 0 && (
            <button
              onClick={() => setIsConflictModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-all animate-pulse"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{validation.errorsCount} Active Clashes</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('auto-generator')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Auto Generator</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        
        {/* Class Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Class:</span>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-indigo-900 focus:ring-2 focus:ring-indigo-500"
          >
            {classes.map(c => (
              <option key={c.id} value={c.name}>Class {c.name} ({c.room})</option>
            ))}
          </select>
        </div>

        {/* Shift Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Shift:</span>
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="regular">Regular Hours (P1 - P8)</option>
            <option value="morning">Morning Coaching (7:30 - 8:30 AM)</option>
            <option value="evening">Evening Coaching (4:30 - 5:30 PM)</option>
          </select>
        </div>

        {/* Highlight Teacher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Highlight Faculty:</span>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700"
          >
            <option value="">-- All Faculty --</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Interactive Grid */}
      <TimetableGrid
        filterClassId={selectedClass}
        shift={selectedShift}
        highlightTeacher={selectedTeacher}
      />

    </div>
  );
}
