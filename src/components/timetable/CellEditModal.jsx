import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { X, Save, Trash2, Lock, Unlock, AlertCircle } from 'lucide-react';

export default function CellEditModal({ cell, onClose, onSave, onDelete }) {
  const { teachers, subjects, classes, laboratories, timetable } = useSchool();

  const [classId, setClassId] = useState(cell.classId || '10-A');
  const [day, setDay] = useState(cell.day || 'Monday');
  const [period, setPeriod] = useState(cell.period || 1);
  const [shift, setShift] = useState(cell.shift || 'regular');
  const [subjectId, setSubjectId] = useState(cell.subjectId || '');
  const [teacherId, setTeacherId] = useState(cell.teacherId || '');
  const [labId, setLabId] = useState(cell.labId || '');
  const [room, setRoom] = useState(cell.room || 'Room 101');
  const [isLocked, setIsLocked] = useState(Boolean(cell.isLocked));

  // Auto update room when class changes
  useEffect(() => {
    const selectedClass = classes.find(c => c.name === classId);
    if (selectedClass && !labId) {
      setRoom(selectedClass.room);
    }
  }, [classId, classes, labId]);

  // When subject changes, recommend primary teacher and lab
  const handleSubjectChange = (newSubId) => {
    setSubjectId(newSubId);
    const sub = subjects.find(s => s.id === newSubId);
    if (sub) {
      if (sub.labId) setLabId(sub.labId);
      // Try to find matching teacher
      const eligibleTeacher = teachers.find(t => 
        t.subjects.includes(sub.name) && (t.classes.includes(classId) || t.classes.length === 0)
      );
      if (eligibleTeacher && !teacherId) {
        setTeacherId(eligibleTeacher.id);
      }
    }
  };

  // Check if selected teacher has a clash at this slot
  const teacherClash = teachers.find(t => t.id === teacherId) ? (
    timetable.find(e => 
      e.teacherId === teacherId && 
      e.day === day && 
      String(e.period) === String(period) && 
      e.classId !== classId &&
      e.shift === shift
    )
  ) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const subObj = subjects.find(s => s.id === subjectId);
    const teacherObj = teachers.find(t => t.id === teacherId);
    const labObj = laboratories.find(l => l.id === labId);

    onSave({
      id: cell.id || `TT-${classId}-${day.slice(0,3)}-P${period}-${Date.now().toString().slice(-4)}`,
      classId,
      day,
      period,
      shift,
      subjectId,
      subjectName: subObj ? subObj.name : '',
      teacherId: teacherId || null,
      teacherName: teacherObj ? teacherObj.name : 'Unassigned',
      room: labObj ? labObj.name : room,
      labId: labId || null,
      isLocked
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              {cell.id ? 'Edit Period Slot' : 'Assign Timetable Slot'}
            </h3>
            <p className="text-xs text-slate-500">
              {day} • Period {period} ({shift === 'regular' ? 'Regular Shift' : shift})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Class & Shift Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class / Section</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.room})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="regular">Regular Hours</option>
                <option value="morning">Morning Coaching</option>
                <option value="evening">Evening Coaching</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              required
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.department} • {s.type})
                </option>
              ))}
            </select>
          </div>

          {/* Teacher */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Assigned Teacher</label>
              {teacherClash && (
                <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3" />
                  Clash: Teaching {teacherClash.classId}!
                </span>
              )}
            </div>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className={`w-full text-xs font-medium bg-slate-50 border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 ${
                teacherClash ? 'border-rose-400 bg-rose-50/50 text-rose-900' : 'border-slate-300'
              }`}
            >
              <option value="">-- Unassigned (Free Period / Study) --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.department} - Max {t.maxPeriodsPerDay}/day)
                </option>
              ))}
            </select>
          </div>

          {/* Room / Laboratory */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Classroom / Room</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Room 101"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratory (Optional)</label>
              <select
                value={labId}
                onChange={(e) => setLabId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None (Regular Classroom)</option>
                {laboratories.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lock Option */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Lock this slot (Prevent AI auto-overwrite)</span>
            </label>
            {isLocked ? (
              <Lock className="w-4 h-4 text-amber-600" />
            ) : (
              <Unlock className="w-4 h-4 text-slate-400" />
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {cell.id ? (
              <button
                type="button"
                onClick={() => onDelete({ classId, day, period, shift })}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Period</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Period</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
