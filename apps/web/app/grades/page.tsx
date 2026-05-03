import SiteHeader from '@/components/site-header';

export default function GradesPage() {
  return (
    <main>
      <SiteHeader title="Grades" subtitle="Scores, trends, and quick grading actions" links={[]} />

      <section className="card glass-shell">
        <div className="bubbles" aria-hidden>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <h2>Grades — Actions</h2>
        <div className="big-buttons-grid">
          <a className="big-button" href="/student">
            <strong>Student Grades</strong>
            <span>View full grade report and trends.</span>
          </a>
          <a className="big-button" href="/staff">
            <strong>Enter Grades</strong>
            <span>Open grading interface for teachers.</span>
          </a>
          <a className="big-button" href="/reports">
            <strong>Export Reports</strong>
            <span>Download progress reports and transcripts.</span>
          </a>
        </div>
      </section>
    </main>
  );
}
