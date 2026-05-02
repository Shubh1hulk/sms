import SiteHeader from '@/components/site-header';
import AttendanceForm from '@/components/attendance-form';
import { getServerJson } from '@/lib/server-api';

const attendanceLinks = [
  { href: '/', label: 'Home' },
  { href: '/login', label: 'Sign in' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/fees', label: 'Fees' }
];

export default async function AttendancePage() {
  const [students, attendance] = await Promise.all([
    getServerJson<Array<any>>('/api/students'),
    getServerJson<Array<any>>('/api/attendance')
  ]);

  return (
    <main className="login-shell">
      <SiteHeader title="Nova Campus" subtitle="Attendance workflow" links={attendanceLinks} />
      <section className="workflow-page">
        <AttendanceForm students={students} attendance={attendance} />
      </section>
    </main>
  );
}
