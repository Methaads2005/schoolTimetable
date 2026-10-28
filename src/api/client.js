const API_BASE = '/api';

export const api = {
  // Full State
  getAll: async () => {
    const res = await fetch(`${API_BASE}/all`);
    return res.json();
  },

  resetDatabase: async () => {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    return res.json();
  },

  // Dashboard Summary
  getDashboardSummary: async () => {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    return res.json();
  },

  // Teachers
  getTeachers: async () => {
    const res = await fetch(`${API_BASE}/teachers`);
    return res.json();
  },
  createTeacher: async (data) => {
    const res = await fetch(`${API_BASE}/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  importTeachers: async (teachers) => {
    const res = await fetch(`${API_BASE}/teachers/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teachers })
    });
    return res.json();
  },
  updateTeacher: async (id, data) => {
    const res = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteTeacher: async (id) => {
    const res = await fetch(`${API_BASE}/teachers/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Classes
  getClasses: async () => {
    const res = await fetch(`${API_BASE}/classes`);
    return res.json();
  },
  createClass: async (data) => {
    const res = await fetch(`${API_BASE}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateClass: async (id, data) => {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteClass: async (id) => {
    const res = await fetch(`${API_BASE}/classes/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Subjects
  getSubjects: async () => {
    const res = await fetch(`${API_BASE}/subjects`);
    return res.json();
  },
  createSubject: async (data) => {
    const res = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateSubject: async (id, data) => {
    const res = await fetch(`${API_BASE}/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteSubject: async (id) => {
    const res = await fetch(`${API_BASE}/subjects/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Laboratories
  getLaboratories: async () => {
    const res = await fetch(`${API_BASE}/laboratories`);
    return res.json();
  },
  createLaboratory: async (data) => {
    const res = await fetch(`${API_BASE}/laboratories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateLaboratory: async (id, data) => {
    const res = await fetch(`${API_BASE}/laboratories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteLaboratory: async (id) => {
    const res = await fetch(`${API_BASE}/laboratories/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Requirements
  getRequirements: async () => {
    const res = await fetch(`${API_BASE}/requirements`);
    return res.json();
  },
  saveRequirements: async (requirements) => {
    const res = await fetch(`${API_BASE}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requirements)
    });
    return res.json();
  },

  // Timetable
  getTimetable: async () => {
    const res = await fetch(`${API_BASE}/timetable`);
    return res.json();
  },
  saveTimetableBulk: async (timetable) => {
    const res = await fetch(`${API_BASE}/timetable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(timetable)
    });
    return res.json();
  },
  saveTimetableEntry: async (entry) => {
    const res = await fetch(`${API_BASE}/timetable/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return res.json();
  },
  deleteTimetableEntry: async (entryInfo) => {
    const res = await fetch(`${API_BASE}/timetable/entry`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryInfo)
    });
    return res.json();
  },

  // Generator & Validator
  generateTimetable: async (options = { preserveLocked: true, applyDirectly: false }) => {
    const res = await fetch(`${API_BASE}/timetable/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    return res.json();
  },
  validateTimetable: async (timetable) => {
    const res = await fetch(`${API_BASE}/timetable/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timetable })
    });
    return res.json();
  },

  // Substitutions
  getSubstitutions: async () => {
    const res = await fetch(`${API_BASE}/substitutions`);
    return res.json();
  },
  createSubstitution: async (data) => {
    const res = await fetch(`${API_BASE}/substitutions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  getSubstitutionRecommendations: async (teacherId, day) => {
    const res = await fetch(`${API_BASE}/substitutions/recommendations?teacherId=${teacherId}&day=${day}`);
    return res.json();
  },

  // Leaves
  getLeaves: async () => {
    const res = await fetch(`${API_BASE}/leaves`);
    return res.json();
  },
  createLeave: async (data) => {
    const res = await fetch(`${API_BASE}/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteLeave: async (id) => {
    const res = await fetch(`${API_BASE}/leaves/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Special Tests
  getSpecialTests: async () => {
    const res = await fetch(`${API_BASE}/tests`);
    return res.json();
  },
  createSpecialTest: async (data) => {
    const res = await fetch(`${API_BASE}/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateSpecialTest: async (id, data) => {
    const res = await fetch(`${API_BASE}/tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteSpecialTest: async (id) => {
    const res = await fetch(`${API_BASE}/tests/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },
  updateSettings: async (settings) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Reports
  getWorkloadReport: async () => {
    const res = await fetch(`${API_BASE}/reports/workload`);
    return res.json();
  }
};
