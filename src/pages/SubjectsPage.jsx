import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { api } from '../api/client';
import { BookOpen, Plus, Edit2, Trash2, X, Save, FlaskConical } from 'lucide-react';

export default function SubjectsPage() {
  const { subjects, laboratories, refreshData, showToast } = useSchool();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const defaultFormData = {
    code: '',
    name: '',
    department: 'Science',
    type: 'Theory',
    weeklyPeriods: 5,
    isConsecutive: false,
    labId: '',
    color: '#3b82f6'
  };

  const [formData, setFormData] = useState(defaultFormData);

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({
      ...defaultFormData,
      code: `SUB-${Math.floor(100 + Math.random() * 900)}`
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSubject(s);
    setFormData({ ...s });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete subject "${name}"?`)) {
      try {
        await api.deleteSubject(id);
        showToast(`Subject ${name} deleted`, 'info');
        await refreshData();
      } catch (err) {
        showToast('Error deleting subject', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await api.updateSubject(editingSubject.id, formData);
        showToast(`Subject ${formData.name} updated`, 'success');
      } else {
        await api.createSubject(formData);
        showToast(`Subject ${formData.name} added`, 'success');
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      showToast('Error saving subject', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            Subject & Curriculum Directory
          </h1>
          <p className="text-xs text-slate-500">
            Define theory subjects, laboratory practicals, weekly quotas, and color themes.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map(sub => (
          <div
            key={sub.id}
            className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden"
          >
            <div 
              className="absolute top-0 left-0 right-0 h-1" 
              style={{ backgroundColor: sub.color || '#4f46e5' }}
            />

            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {sub.code}
                </span>
                <h3 className="font-bold text-slate-900 text-sm font-heading">{sub.name}</h3>
                <span className="text-xs text-indigo-600 font-medium">{sub.department}</span>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                sub.type === 'Lab' 
                  ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                  : sub.type === 'Activity'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {sub.type}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="font-bold text-slate-800">{sub.weeklyPeriods || 4}</span> periods / week
              </div>

              {sub.isConsecutive && (
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[10px]">
                  Double Consecutive
                </span>
              )}
            </div>

            {sub.labId && (
              <div className="text-[11px] text-purple-700 flex items-center gap-1 font-medium bg-purple-50/60 p-1.5 rounded-lg">
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Lab: {laboratories.find(l => l.id === sub.labId)?.name || sub.labId}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
              <button
                onClick={() => openEditModal(sub)}
                className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(sub.id, sub.name)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Physics Core"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Science">Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Languages">Languages</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Practical / Lab</option>
                    <option value="Activity">Sports / Activity</option>
                    <option value="Coaching">Special Coaching</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weekly Periods</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.weeklyPeriods}
                    onChange={(e) => setFormData({ ...formData, weeklyPeriods: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Color Code</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {formData.type === 'Lab' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dedicated Laboratory</label>
                  <select
                    value={formData.labId}
                    onChange={(e) => setFormData({ ...formData, labId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    <option value="">-- Select Lab --</option>
                    {laboratories.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 pt-2">
                <input
                  type="checkbox"
                  checked={formData.isConsecutive}
                  onChange={(e) => setFormData({ ...formData, isConsecutive: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Requires 2 Consecutive Periods (Double Block)</span>
              </label>

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
                  className="flex items-center gap-1 px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Subject</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
