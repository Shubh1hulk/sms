import SiteHeader from '@/components/site-header';
import LoginForm from '@/components/login-form';

const loginLinks = [
  { href: '/', label: 'Home' },
  { href: '/student', label: 'Student' },
  { href: '/parent', label: 'Parent' },
  { href: '/staff', label: 'Teacher' },
  { href: '/admin', label: 'Admin' }
];

export default async function LoginPage() {
  return (
    <main className="login-shell">
      <SiteHeader
        title="Nova Campus"
        subtitle="Secure sign in for every campus role."
        links={loginLinks}
      />

      <section className="login-grid">
        <div className="login-copy card">
          <span className="eyebrow">Authentication flow</span>
          <h2 className="section-title section-title-large">Sign in to the right experience.</h2>
          <p className="role-intro">
            Log in once and the platform sends you to the correct student, parent, teacher, or
            admin surface with your permissions in place.
          </p>

          <div className="credential-grid">
            <div className="credential-card">
              <strong>Student</strong>
              <span>ava@novacampus.dev</span>
            </div>
            <div className="credential-card">
              <strong>Parent</strong>
              <span>olivia@novacampus.dev</span>
            </div>
            <div className="credential-card">
              <strong>Teacher</strong>
              <span>daniel@novacampus.dev</span>
            </div>
            <div className="credential-card">
              <strong>Admin</strong>
              <span>admin@novacampus.dev</span>
            </div>
          </div>

          <div className="notice muted">
            Demo password: <strong>Demo@1234</strong>
          </div>
        </div>

        <div className="login-card card">
          <h2 className="section-title section-title-large">Welcome back</h2>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
