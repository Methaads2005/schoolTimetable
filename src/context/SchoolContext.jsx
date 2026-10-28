import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const SchoolContext = createContext(null);

export function SchoolProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Core Data
  const [schoolInfo, setSchoolInfo] = useState({});
  const [settings, setSettings] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [specialTests, setSpecialTests] = useState([]);
  const [substitutions, setSubstitutions] = useState([]);
  const [leaves, setLeaves] = useState([]);

  // Conflict state
  const [validation, setValidation] = useState({
    isValid: true,
    totalConflicts: 0,
    errorsCount: 0,
    warningsCount: 0,
    conflicts: []
  });

  // UI state
  const [currentRole, setCurrentRole] = useState('admin'); // 'admin' | 'teacher' | 'coordinator'
  const [selectedTeacherId, setSelectedTeacherId] = useState('T101'); // when in teacher view
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch all state
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAll();
      setSchoolInfo(data.schoolInfo || {});
      setSettings(data.settings || {});
      setTeachers(data.teachers || []);
      setClasses(data.classes || []);
      setSubjects(data.subjects || []);
      setLaboratories(data.laboratories || []);
      setRequirements(data.requirements || []);
      setTimetable(data.timetable || []);
      setSpecialTests(data.specialTests || []);
      setSubstitutions(data.substitutions || []);
      setLeaves(data.leaves || []);

      // Validate timetable
      const val = await api.validateTimetable(data.timetable || []);
      setValidation(val);
      setError(null);
    } catch (err) {
      console.error('Failed to load school data:', err);
      setError('Could not connect to the timetable service. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Re-run validation whenever timetable, teachers, leaves change
  const triggerValidation = useCallback(async (currentTt = timetable) => {
    try {
      const val = await api.validateTimetable(currentTt);
      setValidation(val);
      return val;
    } catch (err) {
      console.error('Validation error:', err);
    }
  }, [timetable]);

  // Quick actions
  const resetDatabase = async () => {
    try {
      await api.resetDatabase();
      showToast('School data reset to default sample values', 'info');
      await refreshData();
    } catch (err) {
      showToast('Failed to reset database', 'error');
    }
  };

  const saveCell = async (cellData) => {
    try {
      const saved = await api.saveTimetableEntry(cellData);
      setTimetable(prev => {
        const next = [...prev];
        const idx = next.findIndex(e => 
          e.classId === cellData.classId && 
          e.day === cellData.day && 
          String(e.period) === String(cellData.period) && 
          e.shift === (cellData.shift || 'regular')
        );
        if (idx !== -1) {
          next[idx] = saved;
        } else {
          next.push(saved);
        }
        return next;
      });
      await triggerValidation();
      showToast('Timetable period updated', 'success');
      return saved;
    } catch (err) {
      showToast('Error saving period', 'error');
      throw err;
    }
  };

  const deleteCell = async (cellIdentifier) => {
    try {
      await api.deleteTimetableEntry(cellIdentifier);
      setTimetable(prev => prev.filter(e => 
        !(e.classId === cellIdentifier.classId && 
          e.day === cellIdentifier.day && 
          String(e.period) === String(cellIdentifier.period) && 
          e.shift === (cellIdentifier.shift || 'regular'))
      ));
      await triggerValidation();
      showToast('Period cleared', 'info');
    } catch (err) {
      showToast('Error removing period', 'error');
    }
  };

  const value = {
    loading,
    error,
    schoolInfo,
    settings,
    teachers,
    classes,
    subjects,
    laboratories,
    requirements,
    timetable,
    specialTests,
    substitutions,
    leaves,
    validation,
    currentRole,
    setCurrentRole,
    selectedTeacherId,
    setSelectedTeacherId,
    activeTab,
    setActiveTab,
    isConflictModalOpen,
    setIsConflictModalOpen,
    toast,
    showToast,
    refreshData,
    triggerValidation,
    resetDatabase,
    saveCell,
    deleteCell
  };

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error('useSchool must be used within a SchoolProvider');
  return ctx;
}
