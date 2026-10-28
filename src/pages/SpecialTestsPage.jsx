import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { api } from '../api/client';
import PrintHeader from '../components/timetable/PrintHeader';
import { 
  ClipboardCheck, 
  Plus, 
  Edit2, 
  Trash2, 
  Printer, 
  X, 
  Save, 
  Calendar, 
  Clock, 
  UserCheck, 
  AlertCircle,
  FileText
} from 'lucide-react';

export default function SpecialTestsPage() {
  const { specialTests, classes, subjects, teachers, refreshData, showToast } = useSchool();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  // Focus specifically on Classes 10, 11, 12
  const seniorClasses = classes.filter(c => ['10', '11', '12'].includes(c.grade));

  const defaultFormData = {
    title: 'Class 10 CBSE Model Revision Test',
    classId: '10-A',
    targetClasses: ['10-A'],
    subjectId: 'SUB-MAT',
    subjectName: 'Mathematics',
    testType: 'Unit Test',
    date: '2026-11-15',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    day: 'Monday',
    replacePeriods: [1, 2, 3],
    invigilatorId: 'T105',
    invigilatorName: 'Mrs. Lakshmi Sundaram',
    room: 'Examination Hall 1',
    totalMarks: 50,
    instructions: 'Calculators not permitted. Formula sheet provided with paper.',
    status: 'scheduled'
  };

  const [formData, setFormData] = useState(defaultFormData);

  const openAddModal = () => {
    setEditingTest(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTest(t);
    setFormData({ ...t });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete exam "${title}"?`)) {
      try {
        await api.deleteSpecialTest(id);
        showToast('Test removed from schedule', 'info');
        await refreshData();
      } catch (err) {
        showToast('Error deleting test', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sub = subjects.find(s => s.id === formData.subjectId);
    const teacher = teachers.find(t => t.id === formData.invigilatorId);

    const payload = {
      ...formData,
      subjectName: sub ? sub.name : formData.subjectName,
      invigilatorName: teacher ? teacher.name : formData.invigilatorName
    };

    try {
      if (editingTest) {
        await api.updateSpecialTest(editingTest.id, payload);
        showToast('Test details updated', 'success');
      } else {
        await api.createSpecialTest(payload);
        showToast('Special examination scheduled successfully', 'success');
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      showToast('Error saving special test', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Official Print Header */}
      <PrintHeader
        title="Classes 10, 11 & 12 Special Examination & Test Schedule"
        subtitle="Unit Tests, Revision Tests, Practical Examinations & Model Pre-Boards"
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            Classes 10, 11 & 12 Examination & Test Scheduler
          </h1>
          <p className="text-xs text-slate-500">
            Schedule board revision, unit tests, model pre-boards, and practical exams without disrupting unrelated regular classes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Examination Roster</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Test</span>
          </button>
        </div>
      </div>

      {/* Grid of Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialTests.map(test => (
          <div
            key={test.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100">
                  {test.testType}
                </span>
                <h3 className="font-heading font-bold text-slate-900 text-sm mt-1.5">
                  {test.title}
                </h3>
              </div>

              <div className="flex items-center gap-1 no-print">
                <button
                  onClick={() => openEditModal(test)}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(test.id, test.title)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span>Subject:</span>
                <strong className="text-slate-900 font-semibold">{test.subjectName}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span>Classes:</span>
                <span className="font-semibold text-indigo-700">
                  {test.targetClasses ? test.targetClasses.join(', ') : test.classId}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Date & Day:</span>
                <span>{test.date} ({test.day})</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Timings:</span>
                <span>{test.startTime} - {test.endTime}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Invigilator:</span>
                <strong className="text-slate-800">{test.invigilatorName}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span>Hall / Room:</span>
                <span className="font-mono text-[11px] text-slate-700">{test.room}</span>
              </div>
            </div>

            {test.replacePeriods?.length > 0 && (
              <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Replaces Periods: <strong>{test.replacePeriods.join(', ')}</strong></span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-heading font-bold text-base text-slate-900">
                {editingTest ? 'Edit Special Examination' : 'Schedule Special Examination'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam / Test Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Class 12 Pre-Board Chemistry Practical"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Test Type</label>
                  <select
                    value={formData.testType}
                    onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="Unit Test">Unit Test</option>
                    <option value="Weekly Test">Weekly Test</option>
                    <option value="Revision Test">Revision Test</option>
                    <option value="Model Exam">Model / Pre-Board Exam</option>
                    <option value="Practical Exam">Practical Lab Exam</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Classes Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Candidate Classes (10, 11, 12)</label>
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {seniorClasses.map(c => {
                    const isChecked = (formData.targetClasses || []).includes(c.name);
                    return (
                      <label key={c.id} className="flex items-center gap-1.5 cursor-pointer text-slate-800 font-semibold">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = formData.targetClasses || [];
                            const updated = e.target.checked
                              ? [...current, c.name]
                              : current.filter(x => x !== c.name);
                            setFormData({ ...formData, targetClasses: updated });
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Examination Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="11:30 AM"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Invigilator</label>
                  <select
                    value={formData.invigilatorId}
                    onChange={(e) => setFormData({ ...formData, invigilatorId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Examination Hall</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="Exam Hall 1"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Replaces Regular Periods (e.g. 1, 2, 3)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(p => {
                    const isChecked = (formData.replacePeriods || []).includes(p);
                    return (
                      <label key={p} className="flex items-center gap-1 cursor-pointer font-mono font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = formData.replacePeriods || [];
                            const updated = e.target.checked
                              ? [...current, p]
                              : current.filter(x => x !== p);
                            setFormData({ ...formData, replacePeriods: updated });
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span>P{p}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Examination</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
