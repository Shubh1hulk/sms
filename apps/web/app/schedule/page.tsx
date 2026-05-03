import SiteHeader from '@/components/site-header';

export default function SchedulePage() {
  return (
    <main>
      <SiteHeader title="Schedule" subtitle="Timetable and quick actions" links={[]} />

      <section className="card glass-shell">
        <div className="bubbles" aria-hidden>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <h2>Schedule — Quick Actions</h2>
        <div className="big-buttons-grid">
          <a className="big-button" href="/student">
            <strong>View My Timetable</strong>
            <span>Open student timetable and class details.</span>
          </a>
          <a className="big-button" href="/staff">
            <strong>Manage Timetable</strong>
            <span>Teacher scheduling and substitutions.</span>
          </a>
          <a className="big-button" href="/admin">
            <strong>Publish Calendar</strong>
            <span>School-wide calendar and term dates.</span>
          </a>
        </div>
      </section>
    </main>
  );
}
