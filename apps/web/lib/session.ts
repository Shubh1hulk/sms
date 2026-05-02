import { cookies } from 'next/headers';
import { getServerJson } from '@/lib/server-api';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'staff' | 'admin';
};

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await getServerJson<{ user: SessionUser }>('/api/auth/me', {
      headers: { cookie: cookieHeader }
    });

    return response.user;
  } catch {
    return null;
  }
}
