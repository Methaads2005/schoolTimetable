import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import TimetableGrid from '../components/timetable/TimetableGrid';
import PrintHeader from '../components/timetable/PrintHeader';
import { Users2, Printer, MapPin, User, GraduationCap } from 'lucide-react';

export default function ClassTimetablePage() {
  const { classes, teachers } = useSchool();
  const [selectedClass, setSelectedClass] = useState('10-A');

  const cls = classes.find(c => c.name === selectedClass) || classes[0];
  const classTeacher = teachers.find(t => t.id === cls?.classTeacherId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Official Print Header */}
      <PrintHeader
        title={`Class ${cls?.name} Routine & Period Table`}
        subtitle={`Room: ${cls?.room} • Class Mentor: ${classTeacher ? classTeacher.name : 'Unassigned'}`}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            Class & Section Timetable
          </h1>
          <p className="text-xs text-slate-500">
            Complete weekly curriculum distribution for students, class mentors, and subject coordinators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-indigo-900 shadow-xs focus:ring-2 focus:ring-indigo-500"
          >
            {classes.map(c => (
              <option key={c.id} value={c.name}>
                Class {c.name} ({c.room})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Class Schedule</span>
          </button>
        </div>
      </div>

      {/* Class Meta Banner */}
      {cls && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-base">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-slate-900">Class {cls.name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Room: <strong className="text-slate-800">{cls.room}</strong></span>
                <span>•</span>
                <span>Enrolled: <strong className="text-slate-800">{cls.totalStudents || 40} Students</strong></span>
              </div>
            </div>
          </div>

          <div className="text-xs">
            <span className="text-slate-400">Class Teacher:</span>{' '}
            <span className="font-semibold text-indigo-700">
              {classTeacher ? classTeacher.name : 'Unassigned'}
            </span>
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      <TimetableGrid
        filterClassId={selectedClass}
        shift="regular"
      />

    </div>
  );
}
