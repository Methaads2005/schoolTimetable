import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { api } from '../api/client';
import * as XLSX from 'xlsx';
import { 
  UserX, 
  UserCheck, 
  Calendar, 
  Search, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  Download,
  Trash2,
  Plus
} from 'lucide-react';

export default function SubstitutionPage() {
  const { teachers, timetable, substitutions, leaves, refreshData, showToast } = useSchool();

  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || 'T101');
  const [selectedDay, setSelectedDay] = useState('Wednesday');
  const [recommendations, setRecommendations] = useState(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState('Medical Leave');
  const [activeTab, setActiveTab] = useState('assign'); // 'assign' | 'register' | 'leaves'

  // Fetch recommendations whenever selected teacher or day changes
  useEffect(() => {
    if (!selectedTeacherId || !selectedDay) return;

    let isMounted = true;
    setIsLoadingRecs(true);

    api.getSubstitutionRecommendations(selectedTeacherId, selectedDay)
      .then(res => {
        if (isMounted) {
          setRecommendations(res);
          setIsLoadingRecs(false);
        }
      })
      .catch(err => {
        console.error('Error fetching substitutions:', err);
        if (isMounted) setIsLoadingRecs(false);
      });

    return () => { isMounted = false; };
  }, [selectedTeacherId, selectedDay, substitutions, timetable]);

  // Confirm substitution assignment
  const handleConfirmSubstitution = async (recItem, candidate) => {
    const absentTeacher = teachers.find(t => t.id === selectedTeacherId);

    const subPayload = {
      date: new Date().toISOString().split('T')[0],
      day: selectedDay,
      period: recItem.period,
      classId: recItem.classId,
      subjectId: recItem.subjectId,
      subjectName: recItem.subjectName,
      absentTeacherId: selectedTeacherId,
      absentTeacherName: absentTeacher ? absentTeacher.name : 'Unknown',
      substituteTeacherId: candidate.teacherId,
      substituteTeacherName: candidate.teacherName,
      dutyType: candidate.isSubjectSpecialist ? 'Subject Teaching' : 'Supervised Study / Revision',
      reason: 'Faculty Absence / On Leave',
      assignedBy: 'Administrator',
      status: 'confirmed'
    };

    try {
      await api.createSubstitution(subPayload);
      showToast(`Assigned ${candidate.teacherName} for Period ${recItem.period} (Class ${recItem.classId})`, 'success');
      await refreshData();
    } catch (err) {
      showToast('Error recording substitution', 'error');
    }
  };

  // Mark Teacher Leave
  const handleMarkLeave = async () => {
    const teacher = teachers.find(t => t.id === selectedTeacherId);
    if (!teacher) return;

    try {
      await api.createLeave({
        teacherId: selectedTeacherId,
        teacherName: teacher.name,
        day: selectedDay,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        type: leaveReason,
        status: 'Approved'
      });
      showToast(`Marked ${teacher.name} on leave for ${selectedDay}`, 'info');
      setLeaveModalOpen(false);
      await refreshData();
    } catch (err) {
      showToast('Error logging leave', 'error');
    }
  };

  const handleExportRegister = () => {
    const rows = substitutions.map(s => ({
      'Date': s.date,
      'Day': s.day,
      'Period': `Period ${s.period}`,
      'Class': s.classId,
      'Subject': s.subjectName,
      'Absent Faculty': s.absentTeacherName,
      'Appointed Substitute': s.substituteTeacherName,
      'Duty Mode': s.dutyType,
      'Status': s.status
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Substitution Register');
    XLSX.writeFile(wb, `Substitution_Register_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Exported substitution register to Excel', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            Automatic Substitution & Relief Management
          </h1>
          <p className="text-xs text-slate-500">
            Identify affected slots, compute candidate suitability scores, prevent double booking, and maintain duty logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLeaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
          >
            <UserX className="w-4 h-4" />
            <span>Mark Teacher Absent</span>
          </button>

          <button
            onClick={handleExportRegister}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Register</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('assign')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'assign'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Substitute Assignment Engine
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'register'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Substitution Duty Register ({substitutions.length})
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'leaves'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Staff Leave Roster ({leaves.length})
        </button>
      </div>

      {activeTab === 'assign' && (
        <div className="space-y-6">
          {/* Selector Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  1. Absent Faculty Member:
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-indigo-950 min-w-[240px] focus:ring-2 focus:ring-indigo-500"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  2. Day of Absence:
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-indigo-950 min-w-[150px] focus:ring-2 focus:ring-indigo-500"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Affected Classes:</span>
              <span className="text-base font-bold text-slate-900">
                {recommendations?.totalAffectedPeriods || 0} Periods on {selectedDay}
              </span>
            </div>
          </div>

          {/* Affected Periods and Ranked Candidate Recommendations */}
          {isLoadingRecs ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              Analyzing timetable schedules and free faculty...
            </div>
          ) : !recommendations || recommendations.recommendationsByPeriod?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-heading font-bold text-base text-slate-800">
                No Scheduled Periods Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {teachers.find(t => t.id === selectedTeacherId)?.name} has no regular classes scheduled on {selectedDay}. No substitutions required!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.recommendationsByPeriod.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  {/* Period Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                        P{item.period}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-slate-900 text-sm">
                            Class {item.classId} • Period {item.period}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                            {item.subjectName}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">Classroom: {item.room}</span>
                      </div>
                    </div>

                    {item.currentSubstitution ? (
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Substituted by: {item.currentSubstitution.substituteTeacherName}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Needs Substitute Coverage</span>
                      </div>
                    )}
                  </div>

                  {/* Recommendations Candidates Table */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>Recommended Free Faculty (Ranked by Subject & Workload)</span>
                    </div>

                    {item.candidates.length === 0 ? (
                      <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                        No free faculty available at this specific period. Assign an administrative coordinator for study hall.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {item.candidates.slice(0, 3).map((candidate, cIdx) => (
                          <div
                            key={cIdx}
                            className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 flex flex-col justify-between ${
                              candidate.isSubjectSpecialist
                                ? 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-300'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-start justify-between">
                                <span className="font-bold text-slate-900">{candidate.teacherName}</span>
                                <span className="font-mono text-[10px] font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  Score: {candidate.score}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-500">
                                Dept: <strong>{candidate.department}</strong>
                              </div>

                              <div className="flex flex-wrap gap-1 pt-1">
                                {candidate.reasons.map((r, rIdx) => (
                                  <span key={rIdx} className="text-[9px] font-medium bg-white/80 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200/60">
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => handleConfirmSubstitution(item, candidate)}
                              className="w-full mt-2 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-xs"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Assign Substitute</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Duty Register Tab */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4">Date & Day</th>
                  <th className="py-3 px-3 text-center">Period</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Absent Faculty</th>
                  <th className="py-3 px-4">Appointed Substitute</th>
                  <th className="py-3 px-3">Duty Mode</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {substitutions.map((sub, sIdx) => (
                  <tr key={sIdx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{sub.day}</div>
                      <div className="text-[10px] text-slate-400">{sub.date}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-indigo-700">
                      Period {sub.period}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      Class {sub.classId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{sub.subjectName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 line-through">
                      {sub.absentTeacherName}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {sub.substituteTeacherName}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {sub.dutyType}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Leaves Tab */}
      {activeTab === 'leaves' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Leave Day / Date</th>
                  <th className="py-3 px-4">Type / Reason</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l, lIdx) => (
                  <tr key={lIdx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {l.teacherName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {l.day || 'Today'} ({l.startDate})
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {l.type} - {l.reason || 'Personal'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={async () => {
                          await api.deleteLeave(l.id);
                          showToast('Leave entry removed', 'info');
                          await refreshData();
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mark Leave Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900">
              Log Faculty Leave / Absence
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Faculty Member</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Absence Day</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Category</label>
                <select
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                >
                  <option value="Sick Leave">Sick / Medical Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="On Duty">On Official School Duty</option>
                  <option value="Emergency">Emergency Leave</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setLeaveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkLeave}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
              >
                Confirm Leave & Find Substitutes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
