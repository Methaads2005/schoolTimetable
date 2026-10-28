import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ConflictModal from './components/layout/ConflictModal';

import DashboardPage from './pages/DashboardPage';
import StaffPage from './pages/StaffPage';
import SubjectsPage from './pages/SubjectsPage';
import ClassesPage from './pages/ClassesPage';
import AvailabilityPage from './pages/AvailabilityPage';
import RequirementsPage from './pages/RequirementsPage';
import AutoGeneratorPage from './pages/AutoGeneratorPage';
import TimetableEditorPage from './pages/TimetableEditorPage';
import TeacherTimetablePage from './pages/TeacherTimetablePage';
import ClassTimetablePage from './pages/ClassTimetablePage';
import SubstitutionPage from './pages/SubstitutionPage';
import SpecialTestsPage from './pages/SpecialTestsPage';
import LabsPage from './pages/LabsPage';
import ShiftsPage from './pages/ShiftsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

function MainLayout() {
  const { activeTab, loading, error, toast } = useSchool();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'staff':
        return <StaffPage />;
      case 'subjects':
        return <SubjectsPage />;
      case 'classes':
        return <ClassesPage />;
      case 'availability':
        return <AvailabilityPage />;
      case 'requirements':
        return <RequirementsPage />;
      case 'auto-generator':
        return <AutoGeneratorPage />;
      case 'timetable-editor':
        return <TimetableEditorPage />;
      case 'teacher-timetable':
        return <TeacherTimetablePage />;
      case 'class-timetable':
        return <ClassTimetablePage />;
      case 'substitutions':
        return <SubstitutionPage />;
      case 'special-tests':
        return <SpecialTestsPage />;
      case 'laboratories':
        return <LabsPage />;
      case 'shifts':
        return <ShiftsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-white font-heading font-bold text-lg">
            Loading EduSchedule Timetable Engine...
          </h2>
          <p className="text-xs text-slate-400">
            Initializing constraint solver, faculty rosters, and database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {renderActiveTab()}
        </main>
      </div>

      <ConflictModal />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-slideUp">
          <div className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : toast.type === 'info'
              ? 'bg-indigo-900 text-white border-indigo-800'
              : 'bg-emerald-900 text-white border-emerald-800'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-indigo-300" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <MainLayout />
    </SchoolProvider>
  );
}
