import express from 'express';
import cors from 'cors';
import { store } from './data/store.js';
import { TimetableEngine } from './scheduler.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'EduSchedule Timetable API', timestamp: new Date().toISOString() });
});

// Full state for initial hydrate
app.get('/api/all', (req, res) => {
  res.json(store.getAll());
});

// Reset to factory defaults
app.post('/api/reset', (req, res) => {
  const data = store.reset();
  res.json({ message: 'Database reset to default sample data successfully', data });
});

// Teachers
app.get('/api/teachers', (req, res) => {
  res.json(store.getTeachers());
});

app.post('/api/teachers', (req, res) => {
  const teacher = store.addTeacher(req.body);
  res.status(201).json(teacher);
});

app.post('/api/teachers/import', (req, res) => {
  const { teachers } = req.body;
  if (!Array.isArray(teachers)) {
    return res.status(400).json({ error: 'Expected an array of teachers' });
  }
  const added = [];
  teachers.forEach(t => {
    added.push(store.addTeacher(t));
  });
  res.json({ message: `Imported ${added.length} teachers`, teachers: added });
});

app.put('/api/teachers/:id', (req, res) => {
  const updated = store.updateTeacher(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Teacher not found' });
  res.json(updated);
});

app.delete('/api/teachers/:id', (req, res) => {
  const success = store.deleteTeacher(req.params.id);
  res.json({ success });
});

// Classes
app.get('/api/classes', (req, res) => {
  res.json(store.getClasses());
});

app.post('/api/classes', (req, res) => {
  const cls = store.addClass(req.body);
  res.status(201).json(cls);
});

app.put('/api/classes/:id', (req, res) => {
  const updated = store.updateClass(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Class not found' });
  res.json(updated);
});

app.delete('/api/classes/:id', (req, res) => {
  const success = store.deleteClass(req.params.id);
  res.json({ success });
});

// Subjects
app.get('/api/subjects', (req, res) => {
  res.json(store.getSubjects());
});

app.post('/api/subjects', (req, res) => {
  const sub = store.addSubject(req.body);
  res.status(201).json(sub);
});

app.put('/api/subjects/:id', (req, res) => {
  const updated = store.updateSubject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Subject not found' });
  res.json(updated);
});

app.delete('/api/subjects/:id', (req, res) => {
  const success = store.deleteSubject(req.params.id);
  res.json({ success });
});

// Laboratories
app.get('/api/laboratories', (req, res) => {
  res.json(store.getLaboratories());
});

app.post('/api/laboratories', (req, res) => {
  const lab = store.addLaboratory(req.body);
  res.status(201).json(lab);
});

app.put('/api/laboratories/:id', (req, res) => {
  const updated = store.updateLaboratory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Laboratory not found' });
  res.json(updated);
});

app.delete('/api/laboratories/:id', (req, res) => {
  const success = store.deleteLaboratory(req.params.id);
  res.json({ success });
});

// Requirements
app.get('/api/requirements', (req, res) => {
  res.json(store.getRequirements());
});

app.post('/api/requirements', (req, res) => {
  const reqs = store.setRequirements(req.body);
  res.json(reqs);
});

// Timetable
app.get('/api/timetable', (req, res) => {
  res.json(store.getTimetable());
});

app.post('/api/timetable', (req, res) => {
  const entries = store.setTimetable(req.body);
  res.json(entries);
});

app.post('/api/timetable/entry', (req, res) => {
  const entry = store.updateTimetableEntry(req.body);
  res.json(entry);
});

app.delete('/api/timetable/entry', (req, res) => {
  const { classId, day, period, shift } = req.body;
  const success = store.deleteTimetableEntry(classId, day, period, shift);
  res.json({ success });
});

// Conflict Validation Endpoint
app.post('/api/timetable/validate', (req, res) => {
  const all = store.getAll();
  const timetableToValidate = req.body.timetable || all.timetable;
  const result = TimetableEngine.validateTimetable(
    timetableToValidate,
    all.teachers,
    all.classes,
    all.subjects,
    all.laboratories,
    all.requirements,
    all.leaves,
    all.specialTests
  );
  res.json(result);
});

// Automatic Timetable Generator
app.post('/api/timetable/generate', (req, res) => {
  const all = store.getAll();
  const { preserveLocked = true, applyDirectly = false } = req.body;

  const result = TimetableEngine.generateSchedule({
    classes: all.classes,
    subjects: all.subjects,
    teachers: all.teachers,
    laboratories: all.laboratories,
    requirements: all.requirements,
    settings: all.settings,
    preserveLocked,
    existingTimetable: all.timetable
  });

  if (applyDirectly && result.success) {
    store.setTimetable(result.generatedTimetable);
  }

  res.json(result);
});

// Substitution Recommendations & Logs
app.get('/api/substitutions', (req, res) => {
  res.json(store.getSubstitutions());
});

app.post('/api/substitutions', (req, res) => {
  const sub = store.addSubstitution(req.body);
  res.status(201).json(sub);
});

app.get('/api/substitutions/recommendations', (req, res) => {
  const { teacherId, day } = req.query;
  if (!teacherId || !day) {
    return res.status(400).json({ error: 'teacherId and day query parameters are required' });
  }
  const all = store.getAll();
  const recs = TimetableEngine.getSubstitutionRecommendations(
    teacherId,
    day,
    all.timetable,
    all.teachers,
    all.leaves,
    all.substitutions
  );
  res.json(recs);
});

// Teacher Leaves
app.get('/api/leaves', (req, res) => {
  res.json(store.getLeaves());
});

app.post('/api/leaves', (req, res) => {
  const leave = store.addLeave(req.body);
  res.status(201).json(leave);
});

app.delete('/api/leaves/:id', (req, res) => {
  const success = store.deleteLeave(req.params.id);
  res.json({ success });
});

// Special Tests
app.get('/api/tests', (req, res) => {
  res.json(store.getSpecialTests());
});

app.post('/api/tests', (req, res) => {
  const test = store.addSpecialTest(req.body);
  res.status(201).json(test);
});

app.put('/api/tests/:id', (req, res) => {
  const updated = store.updateSpecialTest(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Test not found' });
  res.json(updated);
});

app.delete('/api/tests/:id', (req, res) => {
  const success = store.deleteSpecialTest(req.params.id);
  res.json({ success });
});

// Settings
app.get('/api/settings', (req, res) => {
  res.json(store.getSettings());
});

app.put('/api/settings', (req, res) => {
  const updated = store.updateSettings(req.body);
  res.json(updated);
});

// Workload & Analytics Report
app.get('/api/reports/workload', (req, res) => {
  const all = store.getAll();
  const teachers = all.teachers;
  const timetable = all.timetable;

  const workloadStats = teachers.map(teacher => {
    const regularPeriods = timetable.filter(e => (e.teacherId === teacher.id || e.substitutedTeacherId === teacher.id) && e.shift === 'regular');
    const morningPeriods = timetable.filter(e => e.teacherId === teacher.id && e.shift === 'morning');
    const eveningPeriods = timetable.filter(e => e.teacherId === teacher.id && e.shift === 'evening');
    const labSessions = timetable.filter(e => e.teacherId === teacher.id && e.labId);
    
    // Day breakdown
    const dayCounts = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
    regularPeriods.forEach(e => {
      if (dayCounts[e.day] !== undefined) dayCounts[e.day]++;
    });

    return {
      teacherId: teacher.id,
      staffId: teacher.staffId,
      name: teacher.name,
      department: teacher.department,
      maxPeriodsPerDay: teacher.maxPeriodsPerDay || 5,
      maxPeriodsPerWeek: teacher.maxPeriodsPerWeek || 24,
      totalAssignedRegular: regularPeriods.length,
      morningCount: morningPeriods.length,
      eveningCount: eveningPeriods.length,
      labCount: labSessions.length,
      totalAllShifts: regularPeriods.length + morningPeriods.length + eveningPeriods.length,
      utilizationPercentage: Math.round((regularPeriods.length / (teacher.maxPeriodsPerWeek || 24)) * 100),
      dayCounts
    };
  });

  res.json(workloadStats);
});

// Dashboard Summary Stats
app.get('/api/dashboard/summary', (req, res) => {
  const all = store.getAll();
  const validation = TimetableEngine.validateTimetable(
    all.timetable,
    all.teachers,
    all.classes,
    all.subjects,
    all.laboratories,
    all.requirements,
    all.leaves,
    all.specialTests
  );

  const activeSubstitutions = all.substitutions.filter(s => s.status === 'confirmed').length;
  const leavesToday = all.leaves.length;
  const upcomingTests = all.specialTests.filter(t => t.status === 'scheduled').length;
  const labSessionsTotal = all.timetable.filter(e => e.labId).length;

  res.json({
    totalTeachers: all.teachers.length,
    totalClasses: all.classes.length,
    totalSubjects: all.subjects.length,
    totalLaboratories: all.laboratories.length,
    totalScheduledPeriods: all.timetable.length,
    validation,
    activeSubstitutions,
    leavesToday,
    upcomingTests,
    labSessionsTotal,
    schoolInfo: all.schoolInfo
  });
});

app.listen(PORT, () => {
  console.log(`EduSchedule Timetable API Server running on port ${PORT}`);
});
