import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { School } from 'lucide-react';

export default function PrintHeader({ title, subtitle }) {
  const { schoolInfo } = useSchool();

  return (
    <div className="hidden print-only mb-6 border-b-2 border-slate-800 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg border-2 border-slate-800 flex items-center justify-center font-bold text-lg">
            <School className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading tracking-tight text-slate-900 uppercase">
              {schoolInfo.name || 'Model Senior Secondary School'}
            </h1>
            <p className="text-xs text-slate-600">
              CBSE Affiliation No: {schoolInfo.code || 'IMSSS-CBSE-4102'} • {schoolInfo.address}
            </p>
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="font-bold text-slate-800">Academic Year: {schoolInfo.academicYear}</div>
          <div className="text-slate-500">Printed On: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-slate-300 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        {subtitle && <span className="text-xs font-semibold text-slate-600">{subtitle}</span>}
      </div>
    </div>
  );
}
