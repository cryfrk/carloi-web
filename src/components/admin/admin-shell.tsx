'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { canAccessAdminPath, findFirstVisibleAdminPath, getVisibleAdminMenu } from '@/lib/admin/menu';

export function AdminShell({
  children,
  roleKeys,
}: {
  children: React.ReactNode;
  roleKeys: string[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleMenu = useMemo(() => getVisibleAdminMenu(roleKeys), [roleKeys]);
  const fallbackPath = useMemo(() => findFirstVisibleAdminPath(roleKeys), [roleKeys]);
  const canAccessPath = useMemo(() => canAccessAdminPath(pathname, roleKeys), [pathname, roleKeys]);

  useEffect(() => {
    if (pathname && !canAccessPath) {
      router.replace(fallbackPath);
    }
  }, [canAccessPath, fallbackPath, pathname, router]);

  if (!canAccessPath) {
    return (
      <div className="page-shell">
        <div className="glass-card admin-hero">
          <div className="eyebrow">Admin Access</div>
          <h1 style={{ margin: '10px 0 10px' }}>Yetkili admin sayfasina yonlendiriliyorsunuz</h1>
          <p className="muted" style={{ margin: 0 }}>
            Bu rota mevcut admin rollerinizle uyumlu degil. Uygun admin ekranina geciliyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="admin-frame">
        <aside className="admin-sidebar glass-card">
          <div className="eyebrow">Carloi Admin</div>
          <h2 style={{ margin: '10px 0 6px' }}>Compliance Console</h2>
          <p className="muted" style={{ margin: 0 }}>
            Inceleme, risk, odeme ve rollout kontrol yuzeyi.
          </p>
          <div className="muted" style={{ marginTop: 12, fontSize: 13 }}>
            Roller: {roleKeys.join(', ')}
          </div>

          <div className="admin-nav">
            {visibleMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx('admin-link', pathname === item.href && 'active')}
              >
                <div>
                  <strong>{item.label}</strong>
                  <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                    {item.description}
                  </div>
                </div>
                <span className="muted">-&gt;</span>
              </Link>
            ))}
          </div>
        </aside>

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
