import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { api } from '../api/client';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  FlaskConical, 
  Sunrise, 
  Sunset,
  X,
  Save,
  Mail,
  Phone
} from 'lucide-react';

export default function StaffPage() {
  const { teachers, refreshData, showToast, subjects, classes } = useSchool();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Form state
  const defaultFormData = {
    staffId: '',
    name: '',
    department: 'Mathematics',
    subjects: ['Mathematics'],
    classes: ['10-A'],
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 24,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    morningAvailable: true,
    eveningAvailable: false,
    labCapability: false,
    preferredSlots: [1, 2, 3],
    status: 'active',
    email: '',
    phone: ''
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Departments list
  const departments = ['Mathematics', 'Science', 'Languages', 'Social Studies', 'Commerce', 'Computer Science', 'Sports'];

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      ...defaultFormData,
      staffId: `STF-${Math.floor(200 + Math.random() * 800)}`
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTeacher(t);
    setFormData({
      ...t,
      subjects: t.subjects || [],
      classes: t.classes || [],
      workingDays: t.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      preferredSlots: t.preferredSlots || [1, 2, 3]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove teacher ${name}? This will unassign them from any scheduled periods.`)) {
      try {
        await api.deleteTeacher(id);
        showToast(`Teacher ${name} deleted successfully`, 'info');
        await refreshData();
      } catch (err) {
        showToast('Error deleting teacher', 'error');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await api.updateTeacher(editingTeacher.id, formData);
        showToast(`Teacher ${formData.name} updated successfully`, 'success');
      } else {
        await api.createTeacher(formData);
        showToast(`Teacher ${formData.name} added successfully`, 'success');
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      showToast('Error saving teacher details', 'error');
    }
  };

  // Export to Excel / CSV
  const handleExport = () => {
    const rows = teachers.map(t => ({
      'Staff ID': t.staffId,
      'Teacher Name': t.name,
      'Department': t.department,
      'Subjects Handled': t.subjects.join(', '),
      'Eligible Classes': t.classes.join(', '),
      'Max Periods / Day': t.maxPeriodsPerDay,
      'Max Periods / Week': t.maxPeriodsPerWeek,
      'Working Days': t.workingDays.join(', '),
      'Morning Shift': t.morningAvailable ? 'Yes' : 'No',
      'Evening Shift': t.eveningAvailable ? 'Yes' : 'No',
      'Lab Handling': t.labCapability ? 'Yes' : 'No',
      'Status': t.status,
      'Email': t.email || '',
      'Phone': t.phone || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');
    XLSX.writeFile(workbook, 'School_Staff_List.xlsx');
    showToast('Exported staff list to Excel successfully', 'success');
  };

  // Filtered teachers
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'ALL' || t.department === filterDept;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            Staff & Faculty Management
          </h1>
          <p className="text-xs text-slate-500">
            Manage teacher profiles, subject qualifications, period limits, shift availability, and lab capabilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl transition-all shadow-xs"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Staff</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by teacher name, staff ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Department:</span>
          </div>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <th className="py-3 px-4">Staff Details</th>
                <th className="py-3 px-4">Department & Subjects</th>
                <th className="py-3 px-4">Eligible Classes</th>
                <th className="py-3 px-3 text-center">Max Load</th>
                <th className="py-3 px-3 text-center">Working Days</th>
                <th className="py-3 px-3 text-center">Shifts & Labs</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map(teacher => (
                <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Teacher Name & Contact */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0">
                        {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{teacher.name}</div>
                        <div className="text-[10px] text-indigo-600 font-mono font-semibold">{teacher.staffId}</div>
                        {teacher.email && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-2.5 h-2.5" />
                            <span>{teacher.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Department & Subjects */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{teacher.department}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.subjects?.map((sub, sIdx) => (
                        <span key={sIdx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Classes */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes?.map((c, cIdx) => (
                        <span key={cIdx} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Max Load */}
                  <td className="py-3 px-3 text-center">
                    <div className="font-bold text-slate-800">{teacher.maxPeriodsPerDay} / day</div>
                    <div className="text-[10px] text-slate-400">{teacher.maxPeriodsPerWeek} / week</div>
                  </td>

                  {/* Working Days */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-medium text-slate-700">
                      {teacher.workingDays ? teacher.workingDays.length : 6} Days
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {teacher.workingDays?.includes('Saturday') ? 'Mon-Sat' : 'Mon-Fri'}
                    </div>
                  </td>

                  {/* Shifts & Labs */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span 
                        title={`Morning Coaching: ${teacher.morningAvailable ? 'Available' : 'Unavailable'}`}
                        className={`p-1 rounded ${teacher.morningAvailable ? 'bg-amber-50 text-amber-600' : 'text-slate-300'}`}
                      >
                        <Sunrise className="w-3.5 h-3.5" />
                      </span>
                      <span 
                        title={`Evening Coaching: ${teacher.eveningAvailable ? 'Available' : 'Unavailable'}`}
                        className={`p-1 rounded ${teacher.eveningAvailable ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300'}`}
                      >
                        <Sunset className="w-3.5 h-3.5" />
                      </span>
                      <span 
                        title={`Laboratory Capability: ${teacher.labCapability ? 'Qualified' : 'Theory only'}`}
                        className={`p-1 rounded ${teacher.labCapability ? 'bg-purple-50 text-purple-600' : 'text-slate-300'}`}
                      >
                        <FlaskConical className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      teacher.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {teacher.status === 'active' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit staff details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id, teacher.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-heading font-bold text-base text-slate-900">
                {editingTeacher ? `Edit Staff: ${editingTeacher.name}` : 'Add New Staff Member'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teacher Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Arvind Sharma"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="active">Active Faculty</option>
                    <option value="inactive">Inactive / On Sabbatical</option>
                  </select>
                </div>
              </div>

              {/* Subjects Handled */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subjects Handled (Select multiple)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  {subjects.map(s => {
                    const isSelected = formData.subjects.includes(s.name);
                    return (
                      <label key={s.id} className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newSubs = e.target.checked
                              ? [...formData.subjects, s.name]
                              : formData.subjects.filter(name => name !== s.name);
                            setFormData({ ...formData, subjects: newSubs });
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span className="truncate">{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Eligible Classes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Eligible Classes to Teach</label>
                <div className="grid grid-cols-4 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  {classes.map(c => {
                    const isSelected = formData.classes.includes(c.name);
                    return (
                      <label key={c.id} className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newCls = e.target.checked
                              ? [...formData.classes, c.name]
                              : formData.classes.filter(name => name !== c.name);
                            setFormData({ ...formData, classes: newCls });
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Workload Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Periods per Day</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.maxPeriodsPerDay}
                    onChange={(e) => setFormData({ ...formData, maxPeriodsPerDay: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Periods per Week</label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={formData.maxPeriodsPerWeek}
                    onChange={(e) => setFormData({ ...formData, maxPeriodsPerWeek: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Available Working Days */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Available Working Days</label>
                <div className="flex flex-wrap gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                    const isChecked = formData.workingDays.includes(day);
                    return (
                      <label key={day} className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newDays = e.target.checked
                              ? [...formData.workingDays, day]
                              : formData.workingDays.filter(d => d !== day);
                            setFormData({ ...formData, workingDays: newDays });
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span>{day}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Shift and Lab Capabilities */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.morningAvailable}
                    onChange={(e) => setFormData({ ...formData, morningAvailable: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Morning Shift</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.eveningAvailable}
                    onChange={(e) => setFormData({ ...formData, eveningAvailable: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Evening Shift</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.labCapability}
                    onChange={(e) => setFormData({ ...formData, labCapability: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Lab Handling</span>
                </label>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@school.edu"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98400 00000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Modal Footer */}
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
                  className="flex items-center gap-1.5 px-5 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Teacher Profile</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Import Staff from CSV / Excel
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Upload an Excel (.xlsx) or CSV file with columns: <code>Teacher Name</code>, <code>Department</code>, <code>Subjects</code>, <code>Classes</code>, <code>MaxPeriodsPerDay</code>.
            </p>

            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (evt) => {
                  try {
                    const data = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(sheet);

                    const imported = json.map((row, idx) => ({
                      staffId: row['Staff ID'] || `STF-IMP-${idx + 1}`,
                      name: row['Teacher Name'] || row.Name || 'New Faculty',
                      department: row.Department || 'Science',
                      subjects: row.Subjects ? String(row.Subjects).split(',').map(s => s.trim()) : ['General'],
                      classes: row.Classes ? String(row.Classes).split(',').map(c => c.trim()) : ['10-A'],
                      maxPeriodsPerDay: Number(row.MaxPeriodsPerDay) || 5,
                      maxPeriodsPerWeek: Number(row.MaxPeriodsPerWeek) || 24,
                      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                      morningAvailable: true,
                      eveningAvailable: false,
                      labCapability: Boolean(row.LabCapability),
                      status: 'active'
                    }));

                    await api.importTeachers(imported);
                    showToast(`Imported ${imported.length} staff records successfully`, 'success');
                    setIsImportModalOpen(false);
                    await refreshData();
                  } catch (err) {
                    showToast('Failed to parse uploaded file', 'error');
                  }
                };
                reader.readAsArrayBuffer(file);
              }}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
