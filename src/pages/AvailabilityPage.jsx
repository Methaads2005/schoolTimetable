import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { api } from '../api/client';
import { CalendarDays, Sunrise, Sunset, Check, X, Clock } from 'lucide-react';

export default function AvailabilityPage() {
  const { teachers, refreshData, showToast } = useSchool();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const toggleDay = async (teacher, day) => {
    const current = teacher.workingDays || [];
    const updatedDays = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];

    try {
      await api.updateTeacher(teacher.id, { workingDays: updatedDays });
      await refreshData();
      showToast(`Updated working days for ${teacher.name}`, 'info');
    } catch (err) {
      showToast('Error updating working day', 'error');
    }
  };

  const toggleShift = async (teacher, shiftField) => {
    try {
      await api.updateTeacher(teacher.id, { [shiftField]: !teacher[shiftField] });
      await refreshData();
      showToast(`Updated shift availability for ${teacher.name}`, 'info');
    } catch (err) {
      showToast('Error updating shift', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            Teacher Availability & Shift Preferences
          </h1>
          <p className="text-xs text-slate-500">
            Click any cell to toggle working days or morning/evening shift eligibility directly.
          </p>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-3 text-center">Department</th>
                {days.map(d => (
                  <th key={d} className="py-3 px-2 text-center">{d.slice(0, 3)}</th>
                ))}
                <th className="py-3 px-3 text-center">Morning Shift</th>
                <th className="py-3 px-3 text-center">Evening Shift</th>
                <th className="py-3 px-3 text-center">Preferred Slots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.map(teacher => (
                <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors">
                  
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{teacher.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{teacher.staffId}</div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-semibold text-slate-700">{teacher.department}</span>
                  </td>

                  {/* Day Toggles */}
                  {days.map(day => {
                    const isAvailable = (teacher.workingDays || []).includes(day);
                    return (
                      <td key={day} className="py-3 px-2 text-center">
                        <button
                          onClick={() => toggleDay(teacher, day)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title={`Click to ${isAvailable ? 'remove' : 'add'} ${day}`}
                        >
                          {isAvailable ? <Check className="w-3.5 h-3.5" /> : <X className="w-3 h-3" />}
                        </button>
                      </td>
                    );
                  })}

                  {/* Morning Shift Toggle */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => toggleShift(teacher, 'morningAvailable')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all inline-flex items-center gap-1 ${
                        teacher.morningAvailable
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <Sunrise className="w-3 h-3" />
                      <span>{teacher.morningAvailable ? 'Yes' : 'No'}</span>
                    </button>
                  </td>

                  {/* Evening Shift Toggle */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => toggleShift(teacher, 'eveningAvailable')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all inline-flex items-center gap-1 ${
                        teacher.eveningAvailable
                          ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <Sunset className="w-3 h-3" />
                      <span>{teacher.eveningAvailable ? 'Yes' : 'No'}</span>
                    </button>
                  </td>

                  {/* Preferred Slots */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {(teacher.preferredSlots || [1, 2, 3]).map(p => (
                        <span key={p} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                          P{p}
                        </span>
                      ))}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
