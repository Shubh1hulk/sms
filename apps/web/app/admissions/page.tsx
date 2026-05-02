import SiteHeader from '@/components/site-header';
import AdmissionsForm from '@/components/admissions-form';
import { getServerJson } from '@/lib/server-api';

const admissionsLinks = [
  { href: '/', label: 'Home' },
  { href: '/login', label: 'Sign in' },
  { href: '/attendance', label: 'Attendance' },
  { href: '/fees', label: 'Fees' }
];

export default async function AdmissionsPage() {
  const admissions = await getServerJson<Array<any>>('/api/admissions');

  return (
    <main className="login-shell">
      <SiteHeader title="Nova Campus" subtitle="Admissions workflow" links={admissionsLinks} />
      <section className="workflow-page">
        <AdmissionsForm admissions={admissions} />
      </section>
    </main>
  );
}
