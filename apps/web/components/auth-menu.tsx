'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { SessionUser } from '@/lib/session';

export default function AuthMenu({ session }: { session: SessionUser | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      router.refresh();
      router.push('/login');
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return (
      <a className="auth-link" href="/login">
        Sign in
      </a>
    );
  }

  return (
    <div className="auth-panel">
      <div>
        <span className="auth-label">Signed in as</span>
        <strong>{session.name}</strong>
        <div className="auth-subtle">{session.role}</div>
      </div>
      <button className="auth-button" type="button" onClick={logout} disabled={busy}>
        {busy ? 'Signing out...' : 'Logout'}
      </button>
    </div>
  );
}
