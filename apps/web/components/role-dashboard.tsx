'use client';

import { useMemo, useState } from 'react';
import type { DashboardSnapshot } from '@/lib/api';

type RoleKey = 'student' | 'parent' | 'staff' | 'admin';

type RoleConfig = {
  key: RoleKey;
  label: string;
  title: string;
  description: string;
  callout: string;
  accent: string;
  highlights: string[];
};

const roles: RoleConfig[] = [
  {
    key: 'student',
    label: 'Student',
    title: 'Student lens',
    description: 'Daily learning, deadlines, grades, and a fast path to self-service.',
    callout: 'Everything a student needs should be visible in under 10 seconds.',
    accent: 'Student-first navigation',
    highlights: ['Today’s schedule', 'Grade momentum', 'Assignments due', 'Announcements']
  },
  {
    key: 'parent',
    label: 'Parent',
    title: 'Parent lens',
    description: 'Attendance, fee status, notices, and support updates without hunting.',
    callout: 'Parents should get the essentials without being forced into admin clutter.',
    accent: 'Trust and visibility',
    highlights: ['Attendance alerts', 'Fee balance', 'School notices', 'Teacher updates']
  },
  {
    key: 'staff',
    label: 'Teacher',
    title: 'Staff lens',
    description: 'Class activity, grading queues, schedule changes, and action reminders.',
    callout: 'Teachers need fast actions, not a deep maze of menus.',
    accent: 'Fast classroom actions',
    highlights: ['Mark attendance', 'Review submissions', 'Class schedule', 'Feedback loop']
  },
  {
    key: 'admin',
    label: 'Admin',
    title: 'Admin lens',
    description: 'Admissions, compliance, reporting, and operations with live trend awareness.',
    callout: 'Admins need a control room that stays clear even as the data grows.',
    accent: 'Operational control',
    highlights: ['Admissions pipeline', 'Analytics', 'Payments', 'Audit-ready records']
  }
];

const roleActions: Record<RoleKey, string[]> = {
  student: ['Open timetable', 'Submit assignment', 'Check grades', 'Message mentor'],
  parent: ['Review attendance', 'Pay fees', 'Read notices', 'Contact staff'],
  staff: ['Mark attendance', 'Review work', 'Post feedback', 'Update schedule'],
  admin: ['Approve admissions', 'Review analytics', 'Export reports', 'Audit activity']
};

function buildRoleMetrics(snapshot: DashboardSnapshot, role: RoleKey): Array<{ label: string; value: string; note: string }> {
  if (role === 'student') {
    return [
      { label: 'Today\'s classes', value: String(snapshot.schedule.length), note: 'Live schedule' },
      { label: 'Grades tracked', value: String(snapshot.grades.length), note: 'Momentum visible' },
      { label: 'Open tasks', value: String(snapshot.tasks.length), note: 'Ready to act' }
    ];
  }

  if (role === 'parent') {
    return [
      { label: 'Attendance', value: snapshot.profile.attendance, note: 'Student presence' },
      { label: 'Fees status', value: 'Current', note: 'Low friction payments' },
      { label: 'Notices', value: String(snapshot.announcements.length), note: 'Recent updates' }
    ];
  }

  if (role === 'staff') {
    return [
      { label: 'Classes today', value: String(snapshot.schedule.length), note: 'Teaching load' },
      { label: 'Submissions', value: String(snapshot.tasks.length), note: 'Review queue' },
      { label: 'Students online', value: String(snapshot.attendance.length), note: 'Current roster' }
    ];
  }

  return [
    { label: 'Modules live', value: String(snapshot.modules.length), note: 'Platform breadth' },
    { label: 'Risk alerts', value: '2', note: 'Needs review' },
    { label: 'Reports ready', value: '14', note: 'Exportable views' }
  ];
}

export default function RoleDashboard({ snapshot }: { snapshot: DashboardSnapshot }) {
  const [activeRole, setActiveRole] = useState<RoleKey>('student');

  const activeConfig = useMemo(
    () => roles.find((role) => role.key === activeRole) ?? roles[0],
    [activeRole]
  );

  const metrics = buildRoleMetrics(snapshot, activeRole);

  return (
    <section className="role-shell" aria-label="Role-based dashboard">
      <div className="role-header">
        <div>
          <span className="eyebrow">Role-based experiences</span>
          <h3 className="section-title section-title-large">Switch the portal by audience</h3>
          <p className="role-intro">
            The same platform can feel like a student app, a parent window, a teacher workbench, or
            an admin control room depending on who is signed in.
          </p>
        </div>
        <div className="role-switch-note">
          <strong>{activeConfig.accent}</strong>
          <span>{activeConfig.callout}</span>
        </div>
      </div>

      <div className="role-tabs" aria-label="Portal roles">
        {roles.map((role) => (
          <button
            key={role.key}
            type="button"
            className={`role-tab ${activeRole === role.key ? 'active' : ''}`}
            onClick={() => setActiveRole(role.key)}
          >
            <span>{role.label}</span>
            <strong>{role.title}</strong>
          </button>
        ))}
      </div>

      <div className="role-panel" role="tabpanel">
        <div className="role-panel-copy">
          <div className="role-panel-badge">{activeConfig.title}</div>
          <h4>{activeConfig.description}</h4>
          <p>{activeConfig.callout}</p>

          <div className="role-kpis">
            {metrics.map((metric) => (
              <div className="role-kpi" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.note}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="role-insights">
          <div className="role-card glass-card">
            <strong>What this role sees</strong>
            <ul className="role-list">
              {activeConfig.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="role-card glass-card">
            <strong>Quick actions</strong>
            <div className="role-actions">
              {roleActions[activeRole].map((action) => (
                <button key={action} type="button" className="role-action">
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="role-card glass-card role-footnote">
            <strong>Shared live context</strong>
            <p>
              {snapshot.profile.name} · {snapshot.profile.cohort} · {snapshot.profile.attendance}{' '}
              attendance · {snapshot.announcements.length} active notices
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
