import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SMS Platform',
  description: 'Modern student management system with live dashboards and role-based experiences.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">{children}</div>
      </body>
    </html>
  );
}
