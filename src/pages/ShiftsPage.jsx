import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { api } from '../api/client';
import TimetableGrid from '../components/timetable/TimetableGrid';
import { Sunrise, Sunset, Clock, Users, Plus, Save, Layers } from 'lucide-react';

export default function ShiftsPage() {
  const { settings, teachers, timetable, refreshData, showToast } = useSchool();

  const [activeShift, setActiveShift] = useState('morning'); // 'morning' | 'evening'
  const [morningStart, setMorningStart] = useState(settings.shifts?.morning?.startTime || '07:30 AM');
  const [morningEnd, setMorningEnd] = useState(settings.shifts?.morning?.endTime || '08:30 AM');
  const [eveningStart, setEveningStart] = useState(settings.shifts?.evening?.startTime || '04:30 PM');
  const [eveningEnd, setEveningEnd] = useState(settings.shifts?.evening?.endTime || '05:30 PM');

  // Filter teachers by shift eligibility
  const eligibleTeachers = teachers.filter(t => 
    activeShift === 'morning' ? t.morningAvailable : t.eveningAvailable
  );

  const shiftEntries = timetable.filter(e => e.shift === activeShift);

  const handleSaveShiftTimings = async () => {
    const updatedSettings = {
      ...settings,
      shifts: {
        ...settings.shifts,
        morning: {
          ...settings.shifts.morning,
          startTime: morningStart,
          endTime: morningEnd
        },
        evening: {
          ...settings.shifts.evening,
          startTime: eveningStart,
          endTime: eveningEnd
        }
      }
    };

    try {
      await api.updateSettings(updatedSettings);
      showToast('Shift coaching timings updated successfully', 'success');
      await refreshData();
    } catch (err) {
      showToast('Error updating shift settings', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            Morning & Evening Coaching Shifts
          </h1>
          <p className="text-xs text-slate-500">
            Independent coaching slots for JEE/NEET competitive preparation, board exam drilling, and remedial support.
          </p>
        </div>

        <button
          onClick={handleSaveShiftTimings}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100"
        >
          <Save className="w-4 h-4" />
          <span>Save Shift Timings</span>
        </button>
      </div>

      {/* Shift Config Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Morning Shift */}
        <div className={`p-5 rounded-2xl border transition-all ${
          activeShift === 'morning' 
            ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Sunrise className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Morning Coaching Shift
                </h3>
                <span className="text-[11px] text-slate-500">Board Exam Drills & Concept Mastery</span>
              </div>
            </div>

            <button
              onClick={() => setActiveShift('morning')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeShift === 'morning'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Select Shift
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-amber-200/60">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Start Time</label>
              <input
                type="text"
                value={morningStart}
                onChange={(e) => setMorningStart(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">End Time</label>
              <input
                type="text"
                value={morningEnd}
                onChange={(e) => setMorningEnd(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Evening Shift */}
        <div className={`p-5 rounded-2xl border transition-all ${
          activeShift === 'evening' 
            ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-400/20' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Sunset className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Evening Remedial & Foundation Shift
                </h3>
                <span className="text-[11px] text-slate-500">Foundation Booster & Practice Sets</span>
              </div>
            </div>

            <button
              onClick={() => setActiveShift('evening')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeShift === 'evening'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Select Shift
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-indigo-200/60">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Start Time</label>
              <input
                type="text"
                value={eveningStart}
                onChange={(e) => setEveningStart(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">End Time</label>
              <input
                type="text"
                value={eveningEnd}
                onChange={(e) => setEveningEnd(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Eligible Faculty Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-heading font-bold text-base text-slate-900">
              Eligible Faculty for {activeShift === 'morning' ? 'Morning Shift' : 'Evening Shift'} ({eligibleTeachers.length})
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {eligibleTeachers.map(t => {
            const shiftLoad = timetable.filter(e => e.teacherId === t.id && e.shift === activeShift).length;
            return (
              <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{t.name}</div>
                  <div className="text-[10px] text-slate-500">{t.department} • {t.staffId}</div>
                </div>
                <span className="font-bold text-indigo-700 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px]">
                  {shiftLoad} Sessions Scheduled
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dedicated Shift Timetable */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-slate-900">
            {activeShift === 'morning' ? 'Morning Shift (7:30 - 8:30 AM)' : 'Evening Shift (4:30 - 5:30 PM)'} Schedule Roster
          </h3>
          <span className="text-xs text-slate-500">{shiftEntries.length} Active Coaching Classes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shiftEntries.map(entry => (
            <div key={entry.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900 text-sm">{entry.subjectName}</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                  {entry.day}
                </span>
              </div>
              <div className="text-slate-600">
                Target: <strong>Class {entry.classId}</strong> • Room: {entry.room}
              </div>
              <div className="text-slate-500 text-[11px]">
                Faculty: <strong className="text-slate-800">{entry.teacherName}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
