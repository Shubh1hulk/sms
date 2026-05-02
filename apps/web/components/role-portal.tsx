import type { DashboardSnapshot } from '@/lib/api';

export type PortalRole = 'student' | 'parent' | 'staff' | 'admin';

type PortalConfig = {
  title: string;
  eyebrow: string;
  summary: string;
  promise: string;
  routeLabel: string;
  highlights: string[];
  actions: string[];
};

const portalConfig: Record<PortalRole, PortalConfig> = {
  student: {
    title: 'Student Portal',
    eyebrow: 'Built for daily learning',
    summary: 'Students get a focused home for schedule, grades, deadlines, and quick actions.',
    promise: 'Fast access to what matters before the school day gets busy.',
    routeLabel: 'student experience',
    highlights: ['Today\'s classes', 'Assignment queue', 'Grades and progress', 'Campus notices'],
    actions: ['Open timetable', 'Submit work', 'Check grades', 'Message mentor']
  },
  parent: {
    title: 'Parent Portal',
    eyebrow: 'Clear family visibility',
    summary: 'Parents see attendance, fee status, notices, and contact options in one place.',
    promise: 'No clutter, just the essentials needed to support a student well.',
    routeLabel: 'parent experience',
    highlights: ['Attendance alerts', 'Fee balance', 'School notices', 'Teacher updates'],
    actions: ['Review attendance', 'Pay fees', 'Read notices', 'Contact staff']
  },
  staff: {
    title: 'Teacher Portal',
    eyebrow: 'Optimized for classroom flow',
    summary: 'Teachers can mark attendance, review work, update schedules, and send feedback quickly.',
    promise: 'Less navigation, more teaching and follow-through.',
    routeLabel: 'teacher experience',
    highlights: ['Mark attendance', 'Review submissions', 'Class schedule', 'Feedback loop'],
    actions: ['Mark attendance', 'Review work', 'Post feedback', 'Update schedule']
  },
  admin: {
    title: 'Admin Portal',
    eyebrow: 'Operational control room',
    summary: 'Admins get admissions, analytics, compliance, payments, and audit surfaces.',
    promise: 'A command view that stays readable as the school grows.',
    routeLabel: 'admin experience',
    highlights: ['Admissions pipeline', 'Analytics', 'Payments', 'Audit-ready records'],
    actions: ['Approve admissions', 'Review analytics', 'Export reports', 'Audit activity']
  }
};

function roleMetrics(snapshot: DashboardSnapshot, role: PortalRole): Array<{ label: string; value: string; note: string }> {
  if (role === 'student') {
    return [
      { label: 'Classes today', value: String(snapshot.schedule.length), note: 'Live timetable' },
      { label: 'Tracked grades', value: String(snapshot.grades.length), note: 'Momentum visible' },
      { label: 'Open tasks', value: String(snapshot.tasks.length), note: 'Needs attention' }
    ];
  }

  if (role === 'parent') {
    return [
      { label: 'Attendance', value: snapshot.profile.attendance, note: 'Student presence' },
      { label: 'Fee status', value: 'Current', note: 'Low-friction payments' },
      { label: 'Notices', value: String(snapshot.announcements.length), note: 'Recent updates' }
    ];
  }

  if (role === 'staff') {
    return [
      { label: 'Classes', value: String(snapshot.schedule.length), note: 'Teaching load' },
      { label: 'Submissions', value: String(snapshot.tasks.length), note: 'Review queue' },
      { label: 'Students', value: String(snapshot.attendance.length), note: 'Current roster' }
    ];
  }

  return [
    { label: 'Modules', value: String(snapshot.modules.length), note: 'Platform breadth' },
    { label: 'Risk alerts', value: '2', note: 'Needs review' },
    { label: 'Reports', value: '14', note: 'Export ready' }
  ];
}

export default function RolePortal({ snapshot, role }: { snapshot: DashboardSnapshot; role: PortalRole }) {
  const config = portalConfig[role];
  const metrics = roleMetrics(snapshot, role);

  return (
    <section className="role-portal-shell">
      <header className="role-portal-hero">
        <div>
          <span className="eyebrow">{config.eyebrow}</span>
          <h1 className="role-portal-title">{config.title}</h1>
          <p className="role-portal-summary">{config.summary}</p>
        </div>
        <div className="role-portal-badge-block">
          <strong>{config.routeLabel}</strong>
          <span>{config.promise}</span>
        </div>
      </header>

      <div className="role-portal-grid">
        <section className="card role-portal-main">
          <h2 className="section-title section-title-large">What this role sees first</h2>
          <div className="role-portal-highlights">
            {config.highlights.map((item) => (
              <div className="stack-item" key={item}>
                <strong>{item}</strong>
                <div className="subtle">Priority items surfaced immediately.</div>
              </div>
            ))}
          </div>
        </section>

        <aside className="role-portal-side">
          <div className="card role-portal-card">
            <h2 className="section-title section-title-large">Live metrics</h2>
            <div className="role-portal-metrics">
              {metrics.map((metric) => (
                <div className="role-portal-metric" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.note}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="card role-portal-card">
            <h2 className="section-title section-title-large">Quick actions</h2>
            <div className="role-actions">
              {config.actions.map((action) => (
                <button key={action} type="button" className="role-action">
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="card role-portal-card">
            <h2 className="section-title section-title-large">Shared context</h2>
            <p className="subtle role-portal-context">
              {snapshot.profile.name} · {snapshot.profile.cohort} · {snapshot.profile.attendance} attendance ·{' '}
              {snapshot.announcements.length} current notices
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
