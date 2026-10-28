import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { api } from '../api/client';
import { Settings, Save, RotateCcw, School, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { schoolInfo, settings, refreshData, showToast, resetDatabase } = useSchool();

  const [info, setInfo] = useState({ ...schoolInfo });
  const [currentSettings, setCurrentSettings] = useState({ ...settings });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(currentSettings);
      showToast('System and schedule settings saved successfully', 'success');
      await refreshData();
    } catch (err) {
      showToast('Error saving settings', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">
            System & Academic Configuration
          </h1>
          <p className="text-xs text-slate-500">
            Configure school affiliation data, period bells, working days, and shift parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Reset all timetables and database records to default school sample data?')) {
                resetDatabase();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Sample Data</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* School Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <School className="w-5 h-5 text-indigo-600" />
            <h2 className="font-heading font-bold text-base text-slate-900">
              Institutional Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Full Name</label>
              <input
                type="text"
                value={info.name || ''}
                onChange={(e) => setInfo({ ...info, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Affiliation / School Code</label>
              <input
                type="text"
                value={info.code || ''}
                onChange={(e) => setInfo({ ...info, code: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={info.academicYear || '2026-2027'}
                onChange={(e) => setInfo({ ...info, academicYear: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Address</label>
              <input
                type="text"
                value={info.address || ''}
                onChange={(e) => setInfo({ ...info, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
              />
            </div>
          </div>
        </div>

        {/* Bell Timings & Structure */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="font-heading font-bold text-base text-slate-900">
              Daily Period Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Daily Periods (Mon-Fri)</label>
              <input
                type="number"
                min="5"
                max="10"
                value={currentSettings.periodsPerDay || 8}
                onChange={(e) => setCurrentSettings({ ...currentSettings, periodsPerDay: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Saturday Working Periods (Half Day)</label>
              <input
                type="number"
                min="4"
                max="8"
                value={currentSettings.saturdayPeriods || 6}
                onChange={(e) => setCurrentSettings({ ...currentSettings, saturdayPeriods: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Regular Day Hours</label>
              <div className="flex items-center gap-2 text-slate-600 p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold">
                <span>09:00 AM – 04:00 PM</span>
              </div>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
