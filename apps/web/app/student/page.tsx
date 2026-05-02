import { getDashboardSnapshot } from '@/lib/api';
import RolePortal from '@/components/role-portal';
import SiteHeader from '@/components/site-header';

export default async function StudentPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <main>
      <SiteHeader
        title="Nova Campus"
        subtitle="Student portal"
        links={[
          { href: '/', label: 'Home' },
          { href: '/parent', label: 'Parent' },
          { href: '/staff', label: 'Teacher' },
          { href: '/admin', label: 'Admin' },
          { href: '/admissions', label: 'Admissions' },
          { href: '/attendance', label: 'Attendance' },
          { href: '/fees', label: 'Fees' }
        ]}
      />
      <RolePortal snapshot={snapshot} role="student" />
    </main>
  );
}
