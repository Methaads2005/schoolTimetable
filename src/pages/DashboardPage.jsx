import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarCheck2, 
  AlertTriangle, 
  UserX, 
  ClipboardCheck, 
  FlaskConical, 
  Sparkles, 
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

export default function DashboardPage() {
  const { 
    teachers, 
    classes, 
    subjects, 
    laboratories, 
    timetable, 
    substitutions, 
    leaves, 
    specialTests, 
    validation, 
    setActiveTab, 
    setIsConflictModalOpen 
  } = useSchool();

  const totalPeriodsScheduled = timetable.length;
  const activeSubstitutionsCount = substitutions.length;
  const teachersOnLeave = leaves.length;
  const upcomingTestsCount = specialTests.filter(t => t.status === 'scheduled').length;
  const labSessionsCount = timetable.filter(e => e.labId).length;

  const statCards = [
    {
      title: "Total Staff Members",
      value: teachers.length,
      subtitle: `${teachers.filter(t => t.status === 'active').length} Active Teachers`,
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      tab: "staff"
    },
    {
      title: "Classes & Sections",
      value: classes.length,
      subtitle: "Classes 8 to 12 (Board Focus)",
      icon: GraduationCap,
      color: "from-violet-500 to-purple-600",
      tab: "classes"
    },
    {
      title: "Scheduled Periods",
      value: totalPeriodsScheduled,
      subtitle: "Master Timetable Slots",
      icon: CalendarCheck2,
      color: "from-emerald-500 to-teal-600",
      tab: "timetable-editor"
    },
    {
      title: "Clash & Conflict Status",
      value: validation.totalConflicts === 0 ? "0 Clashes" : `${validation.errorsCount} Clashes`,
      subtitle: validation.totalConflicts === 0 ? "100% Conflict Free" : `${validation.warningsCount} workload notices`,
      icon: validation.totalConflicts === 0 ? CheckCircle2 : AlertTriangle,
      color: validation.errorsCount > 0 ? "from-rose-500 to-red-600" : "from-emerald-600 to-teal-600",
      action: () => setIsConflictModalOpen(true)
    },
    {
      title: "Today's Substitutions",
      value: activeSubstitutionsCount,
      subtitle: `${teachersOnLeave} Staff on Leave`,
      icon: UserX,
      color: "from-amber-500 to-orange-600",
      tab: "substitutions"
    },
    {
      title: "Upcoming Tests (10-12)",
      value: upcomingTestsCount,
      subtitle: "Unit, Practical & Revision",
      icon: ClipboardCheck,
      color: "from-pink-500 to-rose-600",
      tab: "special-tests"
    },
    {
      title: "Active Laboratories",
      value: laboratories.length,
      subtitle: `${labSessionsCount} Practicals Scheduled`,
      icon: FlaskConical,
      color: "from-cyan-500 to-blue-600",
      tab: "laboratories"
    },
    {
      title: "Curriculum Subjects",
      value: subjects.length,
      subtitle: "Theory + Labs + Sports",
      icon: BookOpen,
      color: "from-indigo-500 to-blue-600",
      tab: "subjects"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI Backtracking Constraint Solver Ready</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
            School Timetable Command Center
          </h1>
          <p className="text-sm text-indigo-100/90 leading-relaxed">
            Automate period distribution, prevent teacher/lab collisions, handle on-duty teacher substitutions, and organize Class 10, 11 & 12 exam sessions effortlessly.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('auto-generator')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Launch Timetable Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('substitutions')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-semibold text-xs border border-indigo-500/50 transition-all"
            >
              <UserX className="w-4 h-4" />
              <span>Assign Today's Substitutes</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => {
                if (card.action) card.action();
                else if (card.tab) setActiveTab(card.tab);
              }}
              className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-indigo-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">{card.title}</span>
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-heading text-slate-900">
                {card.value}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>{card.subtitle}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Detail Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Substitutions & Leave Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-heading font-bold text-base text-slate-900">
                Today's Substitution Duties & Absences
              </h2>
              <p className="text-xs text-slate-500">Live roster for coverage and supervised study</p>
            </div>
            <button
              onClick={() => setActiveTab('substitutions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage Substitutions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {substitutions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No substitution duties recorded for today. All teachers present.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {substitutions.slice(0, 4).map((sub, sIdx) => (
                <div key={sIdx} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        Class {sub.classId} • Period {sub.period}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                        {sub.subjectName}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Absent: <span className="line-through text-slate-400">{sub.absentTeacherName}</span> → Assigned:{' '}
                      <span className="font-semibold text-emerald-700">{sub.substituteTeacherName}</span>
                    </div>
                  </div>

                  <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {sub.status || 'Confirmed'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Quick Actions & Upcoming Exams */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-heading font-bold text-base text-slate-900">
              Classes 10, 11, 12 Tests
            </h2>
            <button
              onClick={() => setActiveTab('special-tests')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {specialTests.slice(0, 3).map((test, tIdx) => (
              <div key={tIdx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 truncate">{test.title}</span>
                  <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100">
                    {test.testType}
                  </span>
                </div>
                <div className="text-slate-600 flex items-center justify-between text-[11px]">
                  <span>Date: {test.date}</span>
                  <span>{test.startTime} - {test.endTime}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Invigilator: <span className="font-medium text-slate-700">{test.invigilatorName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick links buttons */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => setActiveTab('reports')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Timetable to Excel & PDF</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>Add / Manage Staff Details</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
