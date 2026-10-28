import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { api } from '../api/client';
import TimetableGrid from '../components/timetable/TimetableGrid';
import PrintHeader from '../components/timetable/PrintHeader';
import { 
  FlaskConical, 
  Plus, 
  Edit2, 
  Trash2, 
  Printer, 
  Users, 
  MapPin, 
  Cpu, 
  X, 
  Save, 
  Calendar,
  Layers
} from 'lucide-react';

export default function LabsPage() {
  const { laboratories, teachers, timetable, refreshData, showToast } = useSchool();

  const [selectedLabId, setSelectedLabId] = useState(laboratories[0]?.id || 'LAB-CSC1');
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'labs'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState(null);

  const activeLab = laboratories.find(l => l.id === selectedLabId) || laboratories[0];
  const assignedInstructor = teachers.find(t => t.id === activeLab?.assignedInstructorId);

  // Calculate practicals booked in this lab
  const labSessions = timetable.filter(e => e.labId === selectedLabId);

  const defaultFormData = {
    code: 'LAB-BOT-01',
    name: 'Biotechnology & Genetics Lab',
    type: 'Biology',
    capacity: 35,
    room: 'Science Block - 3rd Floor',
    assignedInstructorId: '',
    equipment: 'Centrifuges, Gel Electrophoresis tanks, PCR thermal cyclers',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    notes: 'Safety goggles and aprons required for all students'
  };

  const [formData, setFormData] = useState(defaultFormData);

  const openAddModal = () => {
    setEditingLab(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (lab) => {
    setEditingLab(lab);
    setFormData({ ...lab });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete laboratory "${name}"?`)) {
      try {
        await api.deleteLaboratory(id);
        showToast(`Laboratory ${name} deleted`, 'info');
        await refreshData();
      } catch (err) {
        showToast('Error deleting lab', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLab) {
        await api.updateLaboratory(editingLab.id, formData);
        showToast(`Laboratory ${formData.name} updated`, 'success');
      } else {
        await api.createLaboratory(formData);
        showToast(`Laboratory ${formData.name} created`, 'success');
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      showToast('Error saving laboratory', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Official Print Header */}
      <PrintHeader
        title={`Laboratory Utilization Timetable: ${activeLab?.name}`}
        subtitle={`Location: ${activeLab?.room} • Student Capacity: ${activeLab?.capacity} • In-Charge: ${assignedInstructor ? assignedInstructor.name : 'Unassigned'}`}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            Laboratory & Practicals Management
          </h1>
          <p className="text-xs text-slate-500">
            Track Science, Computer, and Robotics labs, enforce consecutive double-period blocks, and prevent room double-booking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Lab Schedule</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Laboratory</span>
          </button>
        </div>
      </div>

      {/* View Toggle Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 no-print">
        <button
          onClick={() => setActiveTab('grid')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'grid'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Weekly Lab Timetable Grid
        </button>

        <button
          onClick={() => setActiveTab('labs')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'labs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Laboratories Roster ({laboratories.length})
        </button>
      </div>

      {/* Grid Tab */}
      {activeTab === 'grid' && (
        <div className="space-y-6">
          
          {/* Lab Selector Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Laboratory:</span>
              <select
                value={selectedLabId}
                onChange={(e) => setSelectedLabId(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-indigo-950 focus:ring-2 focus:ring-indigo-500"
              >
                {laboratories.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
                ))}
              </select>
            </div>

            {activeLab && (
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Room: <strong className="text-slate-800">{activeLab.room}</strong></span>
                <span>Capacity: <strong className="text-slate-800">{activeLab.capacity} Workstations</strong></span>
                <span>Instructor: <strong className="text-indigo-700">{assignedInstructor ? assignedInstructor.name : 'Unassigned'}</strong></span>
              </div>
            )}
          </div>

          {/* Timetable Grid for Selected Lab */}
          <TimetableGrid
            filterLabId={selectedLabId}
            shift="regular"
          />

        </div>
      )}

      {/* Lab Directory Tab */}
      {activeTab === 'labs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {laboratories.map(lab => {
            const instructor = teachers.find(t => t.id === lab.assignedInstructorId);
            const count = timetable.filter(e => e.labId === lab.id).length;
            return (
              <div
                key={lab.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                      {lab.type}
                    </span>
                    <h3 className="font-heading font-bold text-slate-900 text-base mt-1.5">
                      {lab.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(lab)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(lab.id, lab.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Location:</span>
                    <strong className="text-slate-800">{lab.room}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Max Capacity:</span>
                    <strong className="text-slate-800">{lab.capacity} Students</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Instructor:</span>
                    <span className="font-semibold text-indigo-700">{instructor ? instructor.name : 'Unassigned'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Weekly Sessions:</span>
                    <span className="font-bold text-emerald-700">{count} Periods</span>
                  </div>

                  {lab.equipment && (
                    <div className="pt-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Apparatus: </span>
                      <span>{lab.equipment}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedLabId(lab.id);
                    setActiveTab('grid');
                  }}
                  className="w-full mt-2 py-2 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all"
                >
                  View Weekly Schedule
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                {editingLab ? 'Edit Laboratory' : 'Add New Laboratory'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Laboratory Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. C.V. Raman Physics Laboratory"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Laboratory Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Robotics & Innovation">Robotics & Innovation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room / Floor</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="Science Block - 1st Floor"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Appointed Instructor</label>
                  <select
                    value={formData.assignedInstructorId}
                    onChange={(e) => setFormData({ ...formData, assignedInstructorId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="">-- Unassigned --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Equipment / Apparatus</label>
                <textarea
                  rows="2"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  placeholder="Spectrometers, optical benches..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
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
                  <span>Save Laboratory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
