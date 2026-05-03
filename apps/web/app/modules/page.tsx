import SiteHeader from '@/components/site-header';

export default function ModulesPage() {
  return (
    <main>
      <SiteHeader title="Modules" subtitle="Core modules and quick actions" links={[]} />

      <section className="card glass-shell">
        <div className="bubbles" aria-hidden>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <h2>Modules — Launch actions</h2>
        <div className="big-buttons-grid">
          <a className="big-button" href="/admissions">
            <strong>Admissions</strong>
            <span>Review and process applicants.</span>
          </a>
          <a className="big-button" href="/attendance">
            <strong>Attendance</strong>
            <span>Take attendance and review records.</span>
          </a>
          <a className="big-button" href="/fees">
            <strong>Fees</strong>
            <span>Invoices, payments, and balances.</span>
          </a>
          <a className="big-button" href="/reports">
            <strong>Reports</strong>
            <span>Generate academic and financial reports.</span>
          </a>
          <a className="big-button" href="/messages">
            <strong>Messages</strong>
            <span>Send alerts and announcements.</span>
          </a>
          <a className="big-button" href="/timetable">
            <strong>Timetable</strong>
            <span>Manage and publish schedules.</span>
          </a>
        </div>
      </section>
    </main>
  );
}
