import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  LayoutDashboard,
  UserSquare2,
  BookOpen,
  GraduationCap,
  CalendarDays,
  ListTodo,
  Sparkles,
  TableProperties,
  UserCheck2,
  Users2,
  UserX,
  ClipboardCheck,
  FlaskConical,
  Sunrise,
  BarChart3,
  Settings
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, currentRole, validation, substitutions } = useSchool();

  const navGroups = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['admin', 'coordinator'] }
      ]
    },
    {
      title: "Academic Setup",
      items: [
        { id: "staff", label: "Staff Management", icon: UserSquare2, roles: ['admin'] },
        { id: "subjects", label: "Subject Management", icon: BookOpen, roles: ['admin'] },
        { id: "classes", label: "Classes & Sections", icon: GraduationCap, roles: ['admin'] },
        { id: "availability", label: "Teacher Availability", icon: CalendarDays, roles: ['admin', 'coordinator'] },
        { id: "requirements", label: "Period Requirements", icon: ListTodo, roles: ['admin'] },
      ]
    },
    {
      title: "Timetable Engine",
      items: [
        { id: "auto-generator", label: "Auto Timetable Generator", icon: Sparkles, badge: "AI Solver", roles: ['admin'] },
        { id: "timetable-editor", label: "Manual Timetable Grid", icon: TableProperties, roles: ['admin', 'coordinator'] },
        { id: "teacher-timetable", label: "Teacher Timetable", icon: UserCheck2, roles: ['admin', 'teacher', 'coordinator'] },
        { id: "class-timetable", label: "Class Timetable", icon: Users2, roles: ['admin', 'teacher', 'coordinator'] },
      ]
    },
    {
      title: "Operations & Schedules",
      items: [
        { 
          id: "substitutions", 
          label: "Substitution Manager", 
          icon: UserX, 
          badge: substitutions.length > 0 ? substitutions.length : null,
          roles: ['admin', 'coordinator'] 
        },
        { id: "special-tests", label: "Class 10,11,12 Tests", icon: ClipboardCheck, roles: ['admin', 'teacher', 'coordinator'] },
        { id: "laboratories", label: "Laboratory Manager", icon: FlaskConical, roles: ['admin', 'teacher', 'coordinator'] },
        { id: "shifts", label: "Morning / Evening Shifts", icon: Sunrise, roles: ['admin', 'teacher', 'coordinator'] },
      ]
    },
    {
      title: "Analytics & Config",
      items: [
        { id: "reports", label: "Reports & Workload", icon: BarChart3, roles: ['admin', 'coordinator'] },
        { id: "settings", label: "System Settings", icon: Settings, roles: ['admin'] },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800 select-none no-print">
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group, gIdx) => {
          // Filter items accessible by the current user role
          const visibleItems = group.items.filter(item => item.roles.includes(currentRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {group.title}
              </h3>
              <div className="space-y-0.5 pt-1">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-900/50'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Footer Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 py-1">
          <span>Active Role:</span>
          <span className="font-semibold text-indigo-400 capitalize bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800/60">
            {currentRole}
          </span>
        </div>
      </div>
    </aside>
  );
}
