import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialSchoolData, starterTemplateData } from './initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

class SchoolStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.data = JSON.parse(JSON.stringify(initialSchoolData));
        this.persist();
      } else {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure clean regular hours without morning/evening shifts
        if (!this.data.settings?.regularHours) {
          this.data.settings = initialSchoolData.settings;
        }
        if (!this.data.timetable) this.data.timetable = [];
        if (!this.data.specialTests) this.data.specialTests = [];
        if (!this.data.substitutions) this.data.substitutions = [];
        if (!this.data.leaves) this.data.leaves = [];
      }
    } catch (err) {
      console.error('Error loading DB, restoring initial data:', err);
      this.data = JSON.parse(JSON.stringify(initialSchoolData));
      this.persist();
    }
  }

  persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting DB:', err);
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(initialSchoolData));
    this.persist();
    return this.data;
  }

  loadStarterTemplate() {
    this.data = JSON.parse(JSON.stringify(starterTemplateData));
    this.persist();
    return this.data;
  }

  clearAll() {
    this.data = {
      ...initialSchoolData,
      classes: [],
      subjects: [],
      laboratories: [],
      teachers: [],
      requirements: [],
      timetable: [],
      specialTests: [],
      substitutions: [],
      leaves: []
    };
    this.persist();
    return this.data;
  }

  getAll() {
    return this.data;
  }

  // Teachers
  getTeachers() {
    return this.data.teachers || [];
  }

  addTeacher(teacher) {
    if (!teacher.id) teacher.id = 'T' + Date.now().toString().slice(-4);
    if (!teacher.staffId) teacher.staffId = 'STF-' + Math.floor(100 + Math.random() * 900);
    this.data.teachers.push(teacher);
    this.persist();
    return teacher;
  }

  updateTeacher(id, updates) {
    const idx = this.data.teachers.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.teachers[idx] = { ...this.data.teachers[idx], ...updates };
      if (updates.name) {
        this.data.timetable.forEach(entry => {
          if (entry.teacherId === id) entry.teacherName = updates.name;
        });
      }
      this.persist();
      return this.data.teachers[idx];
    }
    return null;
  }

  deleteTeacher(id) {
    this.data.teachers = this.data.teachers.filter(t => t.id !== id);
    this.data.timetable = this.data.timetable.map(entry => {
      if (entry.teacherId === id) {
        return { ...entry, teacherId: null, teacherName: 'Unassigned' };
      }
      return entry;
    });
    this.persist();
    return true;
  }

  // Classes
  getClasses() {
    return this.data.classes || [];
  }

  addClass(cls) {
    if (!cls.id) cls.id = 'C' + Date.now().toString().slice(-4);
    this.data.classes.push(cls);
    this.persist();
    return cls;
  }

  updateClass(id, updates) {
    const idx = this.data.classes.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.classes[idx] = { ...this.data.classes[idx], ...updates };
      this.persist();
      return this.data.classes[idx];
    }
    return null;
  }

  deleteClass(id) {
    const cls = this.data.classes.find(c => c.id === id);
    if (cls) {
      this.data.classes = this.data.classes.filter(c => c.id !== id);
      this.data.timetable = this.data.timetable.filter(entry => entry.classId !== cls.name);
      this.persist();
      return true;
    }
    return false;
  }

  // Subjects
  getSubjects() {
    return this.data.subjects || [];
  }

  addSubject(sub) {
    if (!sub.id) sub.id = 'SUB-' + Date.now().toString().slice(-4);
    this.data.subjects.push(sub);
    this.persist();
    return sub;
  }

  updateSubject(id, updates) {
    const idx = this.data.subjects.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.subjects[idx] = { ...this.data.subjects[idx], ...updates };
      this.persist();
      return this.data.subjects[idx];
    }
    return null;
  }

  deleteSubject(id) {
    this.data.subjects = this.data.subjects.filter(s => s.id !== id);
    this.persist();
    return true;
  }

  // Laboratories
  getLaboratories() {
    return this.data.laboratories || [];
  }

  addLaboratory(lab) {
    if (!lab.id) lab.id = 'LAB-' + Date.now().toString().slice(-4);
    this.data.laboratories.push(lab);
    this.persist();
    return lab;
  }

  updateLaboratory(id, updates) {
    const idx = this.data.laboratories.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.data.laboratories[idx] = { ...this.data.laboratories[idx], ...updates };
      this.persist();
      return this.data.laboratories[idx];
    }
    return null;
  }

  deleteLaboratory(id) {
    this.data.laboratories = this.data.laboratories.filter(l => l.id !== id);
    this.persist();
    return true;
  }

  // Requirements
  getRequirements() {
    return this.data.requirements || [];
  }

  setRequirements(reqs) {
    this.data.requirements = reqs;
    this.persist();
    return reqs;
  }

  // Timetable
  getTimetable() {
    return this.data.timetable || [];
  }

  setTimetable(entries) {
    this.data.timetable = entries;
    this.persist();
    return entries;
  }

  updateTimetableEntry(entry) {
    if (!entry.id) {
      entry.id = 'TT-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    const idx = this.data.timetable.findIndex(e => 
      e.id === entry.id || 
      (e.classId === entry.classId && e.day === entry.day && String(e.period) === String(entry.period))
    );
    if (idx !== -1) {
      this.data.timetable[idx] = { ...this.data.timetable[idx], ...entry };
    } else {
      this.data.timetable.push(entry);
    }
    this.persist();
    return entry;
  }

  deleteTimetableEntry(classId, day, period) {
    this.data.timetable = this.data.timetable.filter(e => 
      !(e.classId === classId && e.day === day && String(e.period) === String(period))
    );
    this.persist();
    return true;
  }

  // Special Tests
  getSpecialTests() {
    return this.data.specialTests || [];
  }

  addSpecialTest(test) {
    if (!test.id) test.id = 'TEST-' + Date.now().toString().slice(-4);
    this.data.specialTests.push(test);
    this.persist();
    return test;
  }

  updateSpecialTest(id, updates) {
    const idx = this.data.specialTests.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.specialTests[idx] = { ...this.data.specialTests[idx], ...updates };
      this.persist();
      return this.data.specialTests[idx];
    }
    return null;
  }

  deleteSpecialTest(id) {
    this.data.specialTests = this.data.specialTests.filter(t => t.id !== id);
    this.persist();
    return true;
  }

  // Substitutions
  getSubstitutions() {
    return this.data.substitutions || [];
  }

  addSubstitution(sub) {
    if (!sub.id) sub.id = 'SUB-' + Date.now().toString().slice(-4);
    sub.timestamp = new Date().toISOString();
    this.data.substitutions.push(sub);

    const entry = this.data.timetable.find(e => 
      e.classId === sub.classId && 
      e.day === sub.day && 
      String(e.period) === String(sub.period)
    );
    if (entry) {
      entry.substitutedTeacherId = sub.substituteTeacherId;
      entry.substitutedTeacherName = sub.substituteTeacherName;
      entry.isSubstituted = true;
      entry.originalTeacherId = sub.absentTeacherId;
      entry.originalTeacherName = sub.absentTeacherName;
    }

    this.persist();
    return sub;
  }

  // Leaves
  getLeaves() {
    return this.data.leaves || [];
  }

  addLeave(leave) {
    if (!leave.id) leave.id = 'LEV-' + Date.now().toString().slice(-4);
    this.data.leaves.push(leave);
    this.persist();
    return leave;
  }

  deleteLeave(id) {
    this.data.leaves = this.data.leaves.filter(l => l.id !== id);
    this.persist();
    return true;
  }

  // Settings
  getSettings() {
    return this.data.settings;
  }

  updateSettings(settings) {
    this.data.settings = { ...this.data.settings, ...settings };
    this.persist();
    return this.data.settings;
  }
}

export const store = new SchoolStore();
