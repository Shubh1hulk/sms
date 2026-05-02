import { getDashboardSnapshot } from '@/lib/api';
import RolePortal from '@/components/role-portal';
import SiteHeader from '@/components/site-header';

export default async function AdminPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <main>
      <SiteHeader
        title="Nova Campus"
        subtitle="Admin portal"
        links={[
          { href: '/', label: 'Home' },
          { href: '/student', label: 'Student' },
          { href: '/parent', label: 'Parent' },
          { href: '/staff', label: 'Teacher' },
          { href: '/admissions', label: 'Admissions' },
          { href: '/attendance', label: 'Attendance' },
          { href: '/fees', label: 'Fees' }
        ]}
      />
      <RolePortal snapshot={snapshot} role="admin" />
    </main>
  );
}
