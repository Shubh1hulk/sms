import { getDashboardSnapshot } from '@/lib/api';
import type { AuditLogEntry } from '@/lib/api';
import { getCurrentSession } from '@/lib/session';
import { getServerJson } from '@/lib/server-api';
import AuditFeed from '@/components/audit-feed';
import RolePortal from '@/components/role-portal';
import SiteHeader from '@/components/site-header';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getCurrentSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  const [snapshot, auditEntries] = await Promise.all([
    getDashboardSnapshot(),
    getServerJson<AuditLogEntry[]>('/api/audit')
  ]);

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
      <div className="admin-stack">
        <AuditFeed entries={auditEntries} />
      </div>
    </main>
  );
}
