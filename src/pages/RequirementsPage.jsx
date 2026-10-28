import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { api } from '../api/client';
import { ListTodo, Plus, Trash2, Save, Sparkles, Filter } from 'lucide-react';

export default function RequirementsPage() {
  const { classes, subjects, teachers, laboratories, requirements, refreshData, showToast, setActiveTab } = useSchool();

  const [selectedClass, setSelectedClass] = useState('10-A');
  const [localReqs, setLocalReqs] = useState(requirements);

  // Sync if requirements updated externally
  React.useEffect(() => {
    setLocalReqs(requirements);
  }, [requirements]);

  const classReqs = localReqs.filter(r => r.classId === selectedClass);

  const handlePeriodChange = (reqIndex, newPeriods) => {
    const updated = [...localReqs];
    const targetIdx = localReqs.findIndex(r => r === classReqs[reqIndex]);
    if (targetIdx !== -1) {
      updated[targetIdx] = { ...updated[targetIdx], periodsPerWeek: Number(newPeriods) };
      setLocalReqs(updated);
    }
  };

  const handleTeacherChange = (reqIndex, newTeacherId) => {
    const updated = [...localReqs];
    const targetIdx = localReqs.findIndex(r => r === classReqs[reqIndex]);
    if (targetIdx !== -1) {
      updated[targetIdx] = { ...updated[targetIdx], teacherId: newTeacherId };
      setLocalReqs(updated);
    }
  };

  const handleLabChange = (reqIndex, newLabId) => {
    const updated = [...localReqs];
    const targetIdx = localReqs.findIndex(r => r === classReqs[reqIndex]);
    if (targetIdx !== -1) {
      updated[targetIdx] = { ...updated[targetIdx], labId: newLabId, isConsecutive: Boolean(newLabId) };
      setLocalReqs(updated);
    }
  };

  const handleRemoveReq = (reqIndex) => {
    const targetIdx = localReqs.findIndex(r => r === classReqs[reqIndex]);
    if (targetIdx !== -1) {
      const updated = localReqs.filter((_, idx) => idx !== targetIdx);
      setLocalReqs(updated);
    }
  };

  const handleAddSubjectToClass = (subjectId) => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return;

    // Check if already in class
    if (classReqs.some(r => r.subjectId === subjectId)) {
      showToast('This subject is already configured for this class', 'info');
      return;
    }

    // Auto-select qualified teacher
    const qualified = teachers.find(t => 
      t.subjects.includes(sub.name) && (t.classes.includes(selectedClass) || t.classes.length === 0)
    );

    const newReq = {
      classId: selectedClass,
      subjectId: sub.id,
      periodsPerWeek: sub.weeklyPeriods || 4,
      teacherId: qualified ? qualified.id : '',
      labId: sub.labId || null,
      isConsecutive: sub.isConsecutive || false
    };

    setLocalReqs([...localReqs, newReq]);
  };

  const handleSaveAll = async () => {
    try {
      await api.saveRequirements(localReqs);
      showToast('Subject period requirements saved successfully', 'success');
      await refreshData();
    } catch (err) {
      showToast('Error saving requirements', 'error');
    }
  };

  // Calculate total weekly periods for this class
  const totalClassPeriods = classReqs.reduce((acc, r) => acc + (r.periodsPerWeek || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            Class-Subject Period Requirements
          </h1>
          <p className="text-xs text-slate-500">
            Define mandatory weekly period quotas per subject. The Auto Generator splits these across available days.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('auto-generator')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Generate Timetable</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100"
          >
            <Save className="w-4 h-4" />
            <span>Save All Requirements</span>
          </button>
        </div>
      </div>

      {/* Class Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Class:</span>
        </span>
        {classes.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedClass(c.name)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              selectedClass === c.name
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Class {c.name}
          </button>
        ))}
      </div>

      {/* Summary Banner for Selected Class */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-indigo-950 text-sm font-heading">Class {selectedClass}</span>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Total Allocated Periods: <strong className="text-indigo-700">{totalClassPeriods}</strong> periods/week
            (Standard CBSE senior capacity is 46 periods/week including Saturdays)
          </p>
        </div>

        {/* Quick Add Subject Dropdown */}
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddSubjectToClass(e.target.value);
                e.target.value = '';
              }
            }}
            className="text-xs bg-white border border-indigo-200 text-indigo-900 rounded-lg p-2 font-medium shadow-xs"
          >
            <option value="">+ Add Subject to Class {selectedClass}</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-3 text-center">Periods / Week</th>
                <th className="py-3 px-4">Designated Faculty</th>
                <th className="py-3 px-4">Laboratory Room</th>
                <th className="py-3 px-3 text-center">Double Block</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classReqs.map((req, idx) => {
                const sub = subjects.find(s => s.id === req.subjectId);
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{sub ? sub.name : req.subjectId}</div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {sub?.department} • {sub?.type}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={req.periodsPerWeek}
                        onChange={(e) => handlePeriodChange(idx, e.target.value)}
                        className="w-16 text-center font-bold text-xs bg-slate-50 border border-slate-300 rounded-lg p-1.5 focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={req.teacherId || ''}
                        onChange={(e) => handleTeacherChange(idx, e.target.value)}
                        className="w-full max-w-xs text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-1.5 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Auto Match by Qualification --</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={req.labId || ''}
                        onChange={(e) => handleLabChange(idx, e.target.value)}
                        className="w-full max-w-xs text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-1.5 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">None (Regular Classroom)</option>
                        {laboratories.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(req.isConsecutive)}
                        onChange={(e) => {
                          const updated = [...localReqs];
                          const targetIdx = localReqs.findIndex(r => r === classReqs[idx]);
                          if (targetIdx !== -1) {
                            updated[targetIdx] = { ...updated[targetIdx], isConsecutive: e.target.checked };
                            setLocalReqs(updated);
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRemoveReq(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
