'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const roleRedirects: Record<string, string> = {
  student: '/student',
  parent: '/parent',
  staff: '/staff',
  admin: '/admin'
};

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('ava@novacampus.dev');
  const [password, setPassword] = useState('Demo@1234');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const payload = (await response.json()) as { user?: { role?: string }; error?: string };

      if (!response.ok || !payload.user?.role) {
        throw new Error(payload.error ?? 'Unable to sign in.');
      }

      const redirectPath = roleRedirects[payload.user.role] ?? '/';
      router.refresh();
      router.push(redirectPath as Route);
    } catch (thrownError) {
      setError(thrownError instanceof Error ? thrownError.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="workflow-form" onSubmit={submit}>
      <label className="field">
        <span>Email</span>
        <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="field">
        <span>Password</span>
        <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>

      {error ? <div className="notice error">{error}</div> : null}

      <button className="submit-button" type="submit" disabled={busy}>
        {busy ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
