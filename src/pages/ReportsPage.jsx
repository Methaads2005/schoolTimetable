import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { api } from '../api/client';
import * as XLSX from 'xlsx';
import PrintHeader from '../components/timetable/PrintHeader';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Layers,
  FlaskConical,
  UserX,
  Users
} from 'lucide-react';

export default function ReportsPage() {
  const { teachers, timetable, laboratories, specialTests, substitutions, leaves, validation, showToast } = useSchool();

  const [workloadStats, setWorkloadStats] = useState([]);
  const [activeReportTab, setActiveReportTab] = useState('workload');

  useEffect(() => {
    api.getWorkloadReport().then(data => setWorkloadStats(data)).catch(console.error);
  }, [timetable, teachers]);

  // Export Workload to Excel
  const exportWorkloadExcel = () => {
    const rows = workloadStats.map(s => ({
      'Staff ID': s.staffId,
      'Teacher Name': s.name,
      'Department': s.department,
      'Regular Periods': s.totalAssignedRegular,
      'Max Allowed / Week': s.maxPeriodsPerWeek,
      'Utilization %': `${s.utilizationPercentage}%`,
      'Morning Shift': s.morningCount,
      'Evening Shift': s.eveningCount,
      'Lab Sessions': s.labCount,
      'Monday': s.dayCounts?.Monday || 0,
      'Tuesday': s.dayCounts?.Tuesday || 0,
      'Wednesday': s.dayCounts?.Wednesday || 0,
      'Thursday': s.dayCounts?.Thursday || 0,
      'Friday': s.dayCounts?.Friday || 0,
      'Saturday': s.dayCounts?.Saturday || 0
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Faculty Workload');
    XLSX.writeFile(wb, 'Faculty_Weekly_Workload_Report.xlsx');
    showToast('Exported workload report to Excel', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Official Print Header */}
      <PrintHeader
        title="Comprehensive School Timetable & Faculty Workload Audit"
        subtitle="Weekly Allocation, Lab Utilization & Conflict Verification"
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            Reports & Analytical Exports
          </h1>
          <p className="text-xs text-slate-500">
            Generate workload distribution audits, substitution registers, lab utilization sheets, and export to Excel/PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportWorkloadExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 no-print">
        <button
          onClick={() => setActiveReportTab('workload')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
            activeReportTab === 'workload'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Teacher Weekly Workload Audit
        </button>

        <button
          onClick={() => setActiveReportTab('labs')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
            activeReportTab === 'labs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Laboratory Utilization Sheet
        </button>

        <button
          onClick={() => setActiveReportTab('conflicts')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
            activeReportTab === 'conflicts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Clash & Compliance Audit
        </button>
      </div>

      {/* Workload Audit */}
      {activeReportTab === 'workload' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3 text-center">Assigned / Cap</th>
                  <th className="py-3 px-4">Weekly Utilization</th>
                  <th className="py-3 px-2 text-center">Mon</th>
                  <th className="py-3 px-2 text-center">Tue</th>
                  <th className="py-3 px-2 text-center">Wed</th>
                  <th className="py-3 px-2 text-center">Thu</th>
                  <th className="py-3 px-2 text-center">Fri</th>
                  <th className="py-3 px-2 text-center">Sat</th>
                  <th className="py-3 px-3 text-center">Shifts & Labs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workloadStats.map(stat => (
                  <tr key={stat.teacherId} className="hover:bg-slate-50/50">
                    
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{stat.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{stat.staffId}</div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {stat.department}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {stat.totalAssignedRegular} / {stat.maxPeriodsPerWeek}
                    </td>

                    {/* Progress Bar Meter */}
                    <td className="py-3 px-4 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              stat.utilizationPercentage > 100
                                ? 'bg-rose-500'
                                : stat.utilizationPercentage > 85
                                ? 'bg-amber-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${Math.min(stat.utilizationPercentage, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-bold ${
                          stat.utilizationPercentage > 100 ? 'text-rose-600' : 'text-slate-700'
                        }`}>
                          {stat.utilizationPercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center font-mono">{stat.dayCounts?.Monday || 0}</td>
                    <td className="py-3 px-2 text-center font-mono">{stat.dayCounts?.Tuesday || 0}</td>
                    <td className="py-3 px-2 text-center font-mono">{stat.dayCounts?.Wednesday || 0}</td>
                    <td className="py-3 px-2 text-center font-mono">{stat.dayCounts?.Thursday || 0}</td>
                    <td className="py-3 px-2 text-center font-mono">{stat.dayCounts?.Friday || 0}</td>
                    <td className="py-3 px-2 text-center font-mono">{stat.dayCounts?.Saturday || 0}</td>

                    <td className="py-3 px-3 text-center text-[10px] text-slate-500">
                      <span title="Morning">{stat.morningCount}M</span> •{' '}
                      <span title="Evening">{stat.eveningCount}E</span> •{' '}
                      <span title="Lab Practical" className="font-bold text-purple-700">{stat.labCount}L</span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lab Utilization */}
      {activeReportTab === 'labs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4">Laboratory</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-3 text-center">Capacity</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-3 text-center">Total Practical Sessions</th>
                  <th className="py-3 px-4">Scheduled Classes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {laboratories.map(lab => {
                  const sessions = timetable.filter(e => e.labId === lab.id);
                  const uniqueClasses = [...new Set(sessions.map(s => s.classId))];
                  return (
                    <tr key={lab.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{lab.name}</td>
                      <td className="py-3 px-4 text-indigo-700 font-semibold">{lab.type}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">{lab.capacity}</td>
                      <td className="py-3 px-4 text-slate-600">{lab.room}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">{sessions.length} Periods</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {uniqueClasses.map(c => (
                            <span key={c} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                              Class {c}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conflicts & Audit */}
      {activeReportTab === 'conflicts' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              validation.totalConflicts === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {validation.totalConflicts === 0 ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Timetable Compliance Report
              </h3>
              <p className="text-xs text-slate-500">
                Status: {validation.totalConflicts === 0 ? 'Compliant with all school rules' : `${validation.errorsCount} Violations`}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {validation.conflicts.map((c, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 uppercase text-[10px] bg-slate-200 px-1.5 py-0.5 rounded mr-2">
                  {c.type}
                </span>
                <span>{c.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
