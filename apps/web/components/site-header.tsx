import AuthMenu from '@/components/auth-menu';
import { getCurrentSession } from '@/lib/session';

type HeaderLink = { href: string; label: string };

export default async function SiteHeader({
  title,
  subtitle,
  links
}: {
  title: string;
  subtitle: string;
  links: HeaderLink[];
}) {
  const session = await getCurrentSession();

  return (
    <header className="site-header">
      <div className="site-brand">
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </div>
      <nav className="site-nav" aria-label="Primary">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <AuthMenu session={session} />
    </header>
  );
}
