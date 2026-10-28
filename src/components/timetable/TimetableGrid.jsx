import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import CellEditModal from './CellEditModal';
import { 
  Lock, 
  FlaskConical, 
  UserCheck, 
  FileText, 
  Plus, 
  Clock, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';

export default function TimetableGrid({
  filterClassId = null,
  filterTeacherId = null,
  filterLabId = null,
  shift = 'regular',
  readOnly = false,
  highlightTeacher = null
}) {
  const { 
    timetable, 
    settings, 
    subjects, 
    teachers, 
    specialTests, 
    substitutions, 
    saveCell, 
    deleteCell,
    validation
  } = useSchool();

  const [editingCell, setEditingCell] = useState(null);

  const workingDays = settings.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periodTimings = settings.shifts?.regular?.periodTimings || [
    { period: 1, start: "09:00 AM", end: "09:45 AM", type: "class" },
    { period: 2, start: "09:45 AM", end: "10:30 AM", type: "class" },
    { period: "Break", start: "10:30 AM", end: "10:45 AM", type: "break", name: "Recess" },
    { period: 3, start: "10:45 AM", end: "11:30 AM", type: "class" },
    { period: 4, start: "11:30 AM", end: "12:15 PM", type: "class" },
    { period: "Lunch", start: "12:15 PM", end: "01:00 PM", type: "break", name: "Lunch" },
    { period: 5, start: "01:00 PM", end: "01:45 PM", type: "class" },
    { period: 6, start: "01:45 PM", end: "02:30 PM", type: "class" },
    { period: 7, start: "02:30 PM", end: "03:15 PM", type: "class" },
    { period: 8, start: "03:15 PM", end: "04:00 PM", type: "class" }
  ];

  // Map subjects for color styling
  const subjectColorMap = new Map();
  subjects.forEach(s => {
    subjectColorMap.set(s.id, s.color || '#4f46e5');
    subjectColorMap.set(s.name, s.color || '#4f46e5');
  });

  // Filter entries
  const filteredEntries = timetable.filter(entry => {
    if (shift && entry.shift !== shift) return false;
    if (filterClassId && entry.classId !== filterClassId) return false;
    if (filterTeacherId && entry.teacherId !== filterTeacherId && entry.substitutedTeacherId !== filterTeacherId) return false;
    if (filterLabId && entry.labId !== filterLabId) return false;
    return true;
  });

  // Find cell entry
  const getCellData = (day, periodNumber) => {
    return filteredEntries.find(e => e.day === day && String(e.period) === String(periodNumber));
  };

  // Find if special test is scheduled for this class/day/period
  const getTestForSlot = (day, periodNumber, classId) => {
    if (!filterClassId && !classId) return null;
    const targetClass = filterClassId || classId;
    return specialTests.find(t => 
      t.day === day && 
      t.targetClasses?.includes(targetClass) &&
      t.replacePeriods?.includes(Number(periodNumber))
    );
  };

  const handleCellClick = (day, periodNumber, existingEntry) => {
    if (readOnly) return;
    setEditingCell(existingEntry || {
      classId: filterClassId || '10-A',
      day,
      period: periodNumber,
      shift,
      teacherId: filterTeacherId || '',
      labId: filterLabId || ''
    });
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-xs border border-slate-200 print-sheet">
      <table className="w-full text-left border-collapse min-w-[950px]">
        <thead>
          <tr className="bg-slate-100/90 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
            <th className="py-3 px-4 w-32 border-r border-slate-200 bg-slate-200/50">
              Day / Period
            </th>
            {periodTimings.map((col, idx) => {
              if (col.type === 'break') {
                return (
                  <th key={idx} className="py-2 px-2 text-center w-12 bg-slate-100 text-[10px] text-slate-500 border-r border-slate-200">
                    <div className="font-bold">{col.name}</div>
                    <div className="text-[9px] text-slate-400 font-normal">{col.start}</div>
                  </th>
                );
              }
              return (
                <th key={idx} className="py-3 px-3 text-center border-r border-slate-200 min-w-[120px]">
                  <div className="flex items-center justify-center gap-1 font-bold text-slate-800">
                    <span>Period {col.period}</span>
                  </div>
                  <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                    {col.start} - {col.end}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-xs">
          {workingDays.map(day => (
            <tr key={day} className="hover:bg-slate-50/50 transition-colors">
              
              {/* Day Label */}
              <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/60 border-r border-slate-200">
                <div className="flex flex-col">
                  <span className="text-sm font-heading">{day}</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    {day === 'Saturday' ? `${settings.saturdayPeriods || 6} Periods` : `${settings.periodsPerDay || 8} Periods`}
                  </span>
                </div>
              </td>

              {/* Periods */}
              {periodTimings.map((col, idx) => {
                // Break Columns
                if (col.type === 'break') {
                  return (
                    <td 
                      key={idx} 
                      className="py-2 px-1 text-center bg-slate-100/70 border-r border-slate-200 text-[11px] font-medium text-slate-400 select-none"
                    >
                      <div className="rotate-180 writing-mode-vertical py-2 tracking-widest text-[10px] uppercase">
                        {col.name}
                      </div>
                    </td>
                  );
                }

                // Check Saturday period limit
                if (day === 'Saturday' && Number(col.period) > (settings.saturdayPeriods || 6)) {
                  return (
                    <td key={idx} className="py-2 px-2 text-center bg-slate-100/30 border-r border-slate-200 text-slate-300 text-[10px] italic">
                      Weekend Off
                    </td>
                  );
                }

                const entry = getCellData(day, col.period);
                const test = getTestForSlot(day, col.period, entry?.classId);
                const subColor = entry ? (subjectColorMap.get(entry.subjectId) || subjectColorMap.get(entry.subjectName) || '#4f46e5') : '#4f46e5';
                const isSubstituted = entry?.isSubstituted || entry?.substitutedTeacherId;

                return (
                  <td 
                    key={idx} 
                    onClick={() => handleCellClick(day, col.period, entry)}
                    className={`py-2 px-2 border-r border-slate-200 relative group transition-all align-top ${
                      !readOnly ? 'cursor-pointer hover:bg-indigo-50/40' : ''
                    } ${entry?.isLocked ? 'bg-amber-50/20' : ''}`}
                  >
                    {test ? (
                      // Special Test Replacement Banner
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-300 shadow-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                            <FileText className="w-3 h-3 text-rose-600" />
                            {test.testType}
                          </span>
                        </div>
                        <div className="font-bold text-rose-950 text-xs truncate">
                          {test.subjectName}
                        </div>
                        <div className="text-[10px] text-rose-700 truncate">
                          Invigilator: {test.invigilatorName}
                        </div>
                        <div className="text-[9px] text-rose-600/80 font-mono">
                          {test.room}
                        </div>
                      </div>
                    ) : entry ? (
                      // Regular / Lab Timetable Card
                      <div 
                        className="p-2 rounded-lg border shadow-xs transition-all hover:shadow-md space-y-1 bg-white"
                        style={{ borderLeftWidth: '4px', borderLeftColor: subColor }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span 
                            className="font-bold text-slate-900 text-xs truncate max-w-[100px]"
                            title={entry.subjectName}
                          >
                            {entry.subjectName}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            {entry.isConsecutive && (
                              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded" title="Consecutive Period">
                                2P
                              </span>
                            )}
                            {entry.isLocked && (
                              <Lock className="w-3 h-3 text-amber-500" title="Locked Period" />
                            )}
                          </div>
                        </div>

                        {/* Class Info if in teacher view */}
                        {(!filterClassId || filterTeacherId) && (
                          <div className="font-semibold text-indigo-700 text-[11px]">
                            Class {entry.classId}
                          </div>
                        )}

                        {/* Teacher & Substitution */}
                        <div className="text-[10px] text-slate-600 flex items-center gap-1 truncate">
                          {isSubstituted ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                              <span className="line-through text-slate-400 mr-0.5">{entry.originalTeacherName || entry.teacherName}</span>
                              <span>{entry.substitutedTeacherName}</span>
                            </span>
                          ) : (
                            <span className={`truncate ${highlightTeacher === entry.teacherId ? 'font-bold text-indigo-600' : ''}`}>
                              {entry.teacherName || 'Unassigned'}
                            </span>
                          )}
                        </div>

                        {/* Room / Lab */}
                        <div className="text-[9px] text-slate-400 flex items-center justify-between pt-0.5">
                          <span className="flex items-center gap-0.5 truncate" title={entry.room}>
                            {entry.labId ? (
                              <span className="flex items-center gap-0.5 text-purple-700 font-medium">
                                <FlaskConical className="w-2.5 h-2.5" />
                                {entry.room}
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                {entry.room}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Empty Cell
                      <div className="h-16 flex items-center justify-center rounded-lg border border-dashed border-slate-200 text-slate-300 group-hover:border-indigo-300 group-hover:text-indigo-400 transition-all">
                        {!readOnly && (
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-semibold">
                            <Plus className="w-3 h-3" />
                            <span>Assign</span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}

            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingCell && (
        <CellEditModal
          cell={editingCell}
          onClose={() => setEditingCell(null)}
          onSave={async (cellData) => {
            await saveCell(cellData);
            setEditingCell(null);
          }}
          onDelete={async (identifier) => {
            await deleteCell(identifier);
            setEditingCell(null);
          }}
        />
      )}
    </div>
  );
}
