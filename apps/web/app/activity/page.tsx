import SiteHeader from '@/components/site-header';

export default function ActivityPage() {
  return (
    <main>
      <SiteHeader title="Activity" subtitle="Live activity stream and actions" links={[]} />

      <section className="card glass-shell">
        <div className="bubbles" aria-hidden>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <h2>Live Activity — Actions</h2>
        <div className="big-buttons-grid">
          <a className="big-button" href="/attendance">
            <strong>Recent Attendance</strong>
            <span>Jump to recent attendance events.</span>
          </a>
          <a className="big-button" href="/admissions">
            <strong>Admissions Activity</strong>
            <span>New applicants and reviewer notes.</span>
          </a>
          <a className="big-button" href="/admin">
            <strong>Audit Feed</strong>
            <span>Investigate recent system changes.</span>
          </a>
        </div>
      </section>
    </main>
  );
}
