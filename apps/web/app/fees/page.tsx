import SiteHeader from '@/components/site-header';
import FeesForm from '@/components/fees-form';
import { getServerJson } from '@/lib/server-api';

const feesLinks = [
  { href: '/', label: 'Home' },
  { href: '/login', label: 'Sign in' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/attendance', label: 'Attendance' }
];

export default async function FeesPage() {
  const [students, invoices, payments] = await Promise.all([
    getServerJson<Array<any>>('/api/students'),
    getServerJson<Array<any>>('/api/fees/invoices'),
    getServerJson<Array<any>>('/api/fees/payments')
  ]);

  return (
    <main className="login-shell">
      <SiteHeader title="Nova Campus" subtitle="Fees workflow" links={feesLinks} />
      <section className="workflow-page">
        <FeesForm students={students} invoices={invoices} payments={payments} />
      </section>
    </main>
  );
}
