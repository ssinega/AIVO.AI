import React from 'react';
import { SeverityLevel, InvestigationStatus, CapaStatus, RootCauseStatus, EvidenceStatus } from '../../types';

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  if (severity === 'Critical') style = 'bg-red-50 text-red-700 border-red-200 font-semibold';
  else if (severity === 'Major') style = 'bg-amber-50 text-amber-700 border-amber-200 font-medium';
  else if (severity === 'Moderate') style = 'bg-blue-50 text-blue-700 border-blue-200';
  else if (severity === 'Minor') style = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs border ${style}`}>
      {severity}
    </span>
  );
};

interface StatusBadgeProps {
  status: InvestigationStatus | CapaStatus | RootCauseStatus | EvidenceStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  if (['Completed', 'Closed', 'Verified', 'Approved', 'Reviewed'].includes(status)) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['Under Investigation', 'In Progress', 'Under Verification', 'Requested'].includes(status)) {
    style = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (['Under Quality Review', 'Proposed', 'Under Review', 'Effectiveness Check'].includes(status)) {
    style = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (['AI Suggested', 'Pending', 'Open'].includes(status)) {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['Rejected', 'Overdue'].includes(status)) {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${style}`}>
      {status}
    </span>
  );
};
