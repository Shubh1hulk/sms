import { getDashboardSnapshot } from '@/lib/api';
import { getCurrentSession } from '@/lib/session';
import RolePortal from '@/components/role-portal';
import SiteHeader from '@/components/site-header';
import { redirect } from 'next/navigation';

export default async function StaffPage() {
  const session = await getCurrentSession();

  if (!session || (session.role !== 'staff' && session.role !== 'admin')) {
    redirect('/login');
  }

  const snapshot = await getDashboardSnapshot();

  return (
    <main>
      <SiteHeader
        title="Nova Campus"
        subtitle="Teacher portal"
        links={[
          { href: '/', label: 'Home' },
          { href: '/student', label: 'Student' },
          { href: '/parent', label: 'Parent' },
          { href: '/admin', label: 'Admin' },
          { href: '/admissions', label: 'Admissions' },
          { href: '/attendance', label: 'Attendance' },
          { href: '/fees', label: 'Fees' }
        ]}
      />
      <RolePortal snapshot={snapshot} role="staff" />
    </main>
  );
}
