import { getDashboardSnapshot } from '@/lib/api';
import RoleDashboard from '@/components/role-dashboard';
import SiteHeader from '@/components/site-header';

const shortcuts = ['Admissions', 'Attendance', 'Fees', 'Timetable', 'Messages', 'Reports'];

export default async function HomePage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <main>
      <SiteHeader
        title="Nova Campus"
        subtitle="Student management, redesigned for modern campuses."
        links={[
          { href: '#overview', label: 'Overview' },
          { href: '#schedule', label: 'Schedule' },
          { href: '#grades', label: 'Grades' },
          { href: '#activity', label: 'Activity' },
          { href: '#modules', label: 'Modules' },
          { href: '/admissions', label: 'Admissions' },
          { href: '/attendance', label: 'Attendance' },
          { href: '/fees', label: 'Fees' }
        ]}
      />

      <section className="hero" id="overview">
        <article className="hero-card">
          <span className="eyebrow">Live student experience platform</span>
          <h2>Make school operations feel fast, clear, and alive.</h2>
          <p>
            A role-based student management system built for students, teachers, parents, and
            admins. The experience is designed to feel more like a premium product than an internal
            portal, with live updates, sharp visuals, and simple workflows.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#modules">
              Explore modules
            </a>
            <a className="button secondary" href="#activity">
              View live activity
            </a>
          </div>
          <div className="pill-row">
            {shortcuts.map((item) => (
              <span className="pill" key={item}>
                {item}
              </span>
            ))}
          </div>
        </article>

        <aside className="metrics" aria-label="Key metrics">
          <section className="profile-card">
            <div className="profile-badge">Student profile</div>
            <h3>{snapshot.profile.name}</h3>
            <p>
              {snapshot.profile.cohort} · {snapshot.profile.track}
            </p>
            <div className="profile-grid">
              <div>
                <span>Attendance</span>
                <strong>{snapshot.profile.attendance}</strong>
              </div>
              <div>
                <span>GPA</span>
                <strong>{snapshot.profile.gpa}</strong>
              </div>
            </div>
          </section>
          {snapshot.stats.map((item) => (
            <div className="metric" key={item.label}>
              <div className="metric-label">{item.label}</div>
              <strong>{item.value}</strong>
              <div className="subtle spacing-sm">
                {item.delta}
              </div>
            </div>
          ))}
        </aside>
      </section>

      <RoleDashboard snapshot={snapshot} />

      <section className="portal-links" aria-label="Dedicated portals">
        <div className="card portal-links-card">
          <h3 className="section-title section-title-large">Dedicated portals</h3>
          <p className="role-intro">
            Each audience now has its own landing route, making the experience feel closer to a real
            product and less like a single generic dashboard.
          </p>
          <div className="portal-links-grid">
            <a className="portal-link" href="/student">
              <strong>Student portal</strong>
              <span>Schedule, grades, tasks, and quick self-service.</span>
            </a>
            <a className="portal-link" href="/parent">
              <strong>Parent portal</strong>
              <span>Attendance, fees, notices, and support updates.</span>
            </a>
            <a className="portal-link" href="/staff">
              <strong>Teacher portal</strong>
              <span>Mark attendance, review work, and send feedback.</span>
            </a>
            <a className="portal-link" href="/admin">
              <strong>Admin portal</strong>
              <span>Admissions, analytics, operations, and audit trails.</span>
            </a>
            <a className="portal-link" href="/login">
              <strong>Login flow</strong>
              <span>Authenticate and jump to the correct role automatically.</span>
            </a>
            <a className="portal-link" href="/admissions">
              <strong>Admissions</strong>
              <span>Capture new applicants and review the queue.</span>
            </a>
            <a className="portal-link" href="/attendance">
              <strong>Attendance</strong>
              <span>Mark presence and keep a recent activity feed.</span>
            </a>
            <a className="portal-link" href="/fees">
              <strong>Fees</strong>
              <span>Create invoices, record payments, and view balances.</span>
            </a>
          </div>
        </div>
      </section>

      <div className="grid" id="schedule">
        <section className="card wide">
          <h3 className="section-title">Today’s schedule</h3>
          <div className="timeline">
            {snapshot.schedule.map((item) => (
              <div className="timeline-item" key={item.time + item.title}>
                <div className={`timeline-chip ${item.status === 'Now' ? 'now' : 'later'}`}>
                  {item.time}
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <div className="subtle">{item.room}</div>
                </div>
                <div className="meta">{item.status}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card tall" id="grades">
          <h3 className="section-title">Academic snapshot</h3>
          <div className="grade-list">
            {snapshot.grades.map((item) => (
              <div className="grade-row" key={item.subject}>
                <div>
                  <strong>{item.subject}</strong>
                  <span className="subtle">Momentum</span>
                </div>
                <div className="grade-score">{item.score}</div>
                <div className={`trend ${item.trend.startsWith('+') ? 'up' : 'flat'}`}>{item.trend}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid" id="activity">
        <section className="card wide">
          <h3 className="section-title">Live activity</h3>
          <div className="table">
            {snapshot.attendance.map((row) => (
              <div className="row" key={row.name}>
                <div>
                  <strong>{row.name}</strong>
                  <span className="subtle">{row.className}</span>
                </div>
                <div>
                  <strong>Attendance</strong>
                  <span className="subtle">Updated just now</span>
                </div>
                <div>
                  <strong>Delivery</strong>
                  <span className="subtle">Parent alert ready</span>
                </div>
                <span className={`status ${row.status === 'Present' ? 'ok' : 'warn'}`}>{row.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card tall">
          <h3 className="section-title">Announcement stream</h3>
          <div className="stack">
            {snapshot.announcements.map((item) => (
              <div className="stack-item" key={item.title}>
                <strong>{item.title}</strong>
                <div className="subtle">{item.audience}</div>
                <div className="meta spacing-sm">
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid" id="modules">
        <section className="card wide">
          <h3 className="section-title">Core modules</h3>
          <div className="split">
            {snapshot.modules.map((module) => (
              <div className="stack-item" key={module.title}>
                <strong>{module.title}</strong>
                <div className="subtle">{module.description}</div>
                <div className="meta spacing-md">
                  Status: {module.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card tall" id="engagement">
          <h3 className="section-title">Action queue</h3>
          <p>
            The first implementation is focused on a polished student portal plus a reliable admin
            layer. Python is reserved for analytics and automation so we can add predictive insights
            without slowing down the core product.
          </p>
          <div className="task-list spacing-lg">
            {snapshot.tasks.map((task) => (
              <div className="task-item" key={task.title}>
                <div>
                  <strong>{task.title}</strong>
                  <div className="subtle">Due {task.due}</div>
                </div>
                <span className={`status ${task.level === 'High' ? 'warn' : task.level === 'Medium' ? 'info' : 'ok'}`}>
                  {task.level}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
