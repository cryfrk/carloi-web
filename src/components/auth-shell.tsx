import Image from 'next/image';
import Link from 'next/link';

import { webEnv } from '@/lib/env';

const trustItems = [
  {
    title: 'Tek backend, tek oturum',
    detail:
      'www.carloi.com ve mobil uygulama ayni API kaynagini kullanir. Kayit, giris, ilan ve mesajlasma ayni hesapta senkron kalir.',
  },
  {
    title: 'Dogrulama kontrollu',
    detail:
      'E-posta linkleri web alanina, SMS kodlari ise zaman sinirli dogrulama akisina gider. Kullanici teknik hata yerine anlasilir durum mesajlari gorur.',
  },
  {
    title: 'Ticari onboarding hazir',
    detail:
      'Sirket bilgisi, belge yukleme ve platform inceleme adimlari kayit sonrasi ayarlar ekranindan devam eder.',
  },
];

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
      <div className="auth-panel">
        <aside className="auth-side">
          <div className="auth-brand">
            <Image src="/carloi.png" alt="Carloi" width={56} height={56} />
            <div>
              <div className="eyebrow">{webEnv.appName}</div>
              <strong>Otomotiv sosyal platformu</strong>
            </div>
          </div>

          <div className="stack" style={{ gap: 16 }}>
            <h1 className="auth-display-title">Arac ilanlari, feed ve mesajlasma ayni yerde.</h1>
            <p className="auth-lead">
              Carloi web, sosyal akisi ve arac ticareti deneyimini daha hizli, daha temiz ve daha
              guvenli bir masaustu yuzeyine tasir.
            </p>
          </div>

          <div className="stack">
            {trustItems.map((item) => (
              <div key={item.title} className="auth-trust-card">
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="auth-content">
          <div className="stack">
            <div className="eyebrow">Carloi hesabin</div>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <p className="muted" style={{ margin: 0 }}>
              {subtitle}
            </p>
          </div>

          <div className="auth-form-card">{children}</div>

          {alternateHref && alternateLabel ? (
            <div className="post-actions">
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
