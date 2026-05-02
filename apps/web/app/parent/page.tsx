import { getDashboardSnapshot } from '@/lib/api';
import RolePortal from '@/components/role-portal';
import SiteHeader from '@/components/site-header';

export default async function ParentPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <main>
      <SiteHeader
        title="Nova Campus"
        subtitle="Parent portal"
        links={[
          { href: '/', label: 'Home' },
          { href: '/student', label: 'Student' },
          { href: '/staff', label: 'Teacher' },
          { href: '/admin', label: 'Admin' },
          { href: '/admissions', label: 'Admissions' },
          { href: '/attendance', label: 'Attendance' },
          { href: '/fees', label: 'Fees' }
        ]}
      />
      <RolePortal snapshot={snapshot} role="parent" />
    </main>
  );
}
