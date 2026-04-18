import Image from 'next/image';
import Link from 'next/link';

import { webEnv } from '@/lib/env';

export function AuthShell({
  title,
  subtitle,
  alternateHref,
  alternateLabel,
  children,
}: {
  title: string;
  subtitle: string;
  alternateHref?: string;
  alternateLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-wrapper">
      <div className="auth-panel glass-card">
        <aside className="auth-side">
          <div className="eyebrow">{webEnv.appName}</div>
          <h1 style={{ fontSize: '3rem', marginBottom: 12 }}>Araç al, sat, analiz et.</h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', maxWidth: 480, lineHeight: 1.7 }}>
            Carloi web, mobil deneyimi büyütmez; masaüstü için yeniden kurgulanmış profesyonel bir
            kontrol yüzeyi sunar. Akış, ilanlar, Loi AI ve mesajlar aynı hesapla senkron kalır.
          </p>
          <div style={{ marginTop: 32, display: 'grid', gap: 14 }}>
            <div className="soft-card" style={{ padding: 18, background: 'rgba(255,255,255,0.08)', color: 'white' }}>
              <strong>Aynı hesap</strong>
              <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.68)' }}>
                Mobil ve web aynı feed, aynı mesajlar, aynı ilan mantığı ile çalışır.
              </div>
            </div>
            <div className="soft-card" style={{ padding: 18, background: 'rgba(255,255,255,0.08)', color: 'white' }}>
              <strong>Loi AI</strong>
              <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.68)' }}>
                Piyasa karşılaştırması, araç seçimi, kronik arızalar ve ilan yorumları tek panelde.
              </div>
            </div>
          </div>
        </aside>
        <section className="auth-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Image src="/carloi.png" alt="Carloi" width={42} height={42} />
            <div>
              <div className="eyebrow">Carloi Web</div>
              <strong>{title}</strong>
            </div>
          </div>
          <p className="muted" style={{ marginBottom: 24 }}>
            {subtitle}
          </p>
          {children}
          {alternateHref && alternateLabel ? (
            <div style={{ marginTop: 18 }}>
              <Link className="muted" href={alternateHref}>
                {alternateLabel}
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
