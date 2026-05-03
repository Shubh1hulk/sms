import SiteHeader from '@/components/site-header';

export default function OverviewPage() {
  return (
    <main>
      <SiteHeader title="Overview" subtitle="Quick access to core workflows" links={[]} />

      <section className="card glass-shell">
        <div className="bubbles" aria-hidden>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <h2>Overview — Big Actions</h2>
        <div className="big-buttons-grid">
          <a className="big-button" href="/admissions">
            <strong>Admissions</strong>
            <span>Review applicants and manage intake.</span>
          </a>
          <a className="big-button" href="/attendance">
            <strong>Attendance</strong>
            <span>Mark presence and review recent activity.</span>
          </a>
          <a className="big-button" href="/fees">
            <strong>Fees</strong>
            <span>Create invoices and record payments.</span>
          </a>
          <a className="big-button" href="/student">
            <strong>Student Portal</strong>
            <span>Student-facing dashboard and self-service.</span>
          </a>
          <a className="big-button" href="/staff">
            <strong>Staff Portal</strong>
            <span>Teacher tools: attendance, feedback, grading.</span>
          </a>
          <a className="big-button" href="/admin">
            <strong>Admin Console</strong>
            <span>Operations, audit trails, and system settings.</span>
          </a>
        </div>
      </section>
    </main>
  );
}
