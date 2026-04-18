import Link from 'next/link';

import { webEnv } from '@/lib/env';

export default function LandingPage() {
  return (
    <main className="page-shell public-layout">
      <section className="glass-card hero-grid">
        <div>
          <div className="eyebrow">{webEnv.appName}</div>
          <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', lineHeight: 1.04, margin: '14px 0 12px' }}>
            Otomotiv sosyal platformunu masaüstüne taşı.
          </h1>
          <p className="muted" style={{ maxWidth: 620, lineHeight: 1.8 }}>
            Carloi web; sosyal akış, araç ilanları, profesyonel mesajlaşma ve Loi AI katmanını masaüstü için yeniden
            tasarlanmış bir yüzeyde birleştirir. Aynı hesabınla web ve mobil arasında kesintisiz geçiş yap.
          </p>
          <div className="landing-actions">
            <Link className="button button-primary" href="/register">
              Hemen başla
            </Link>
            <Link className="button button-secondary" href="/login">
              Giriş yap
            </Link>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 24, display: 'grid', gap: 16 }}>
          <div className="eyebrow">Carloi Web Deneyimi</div>
          <div className="three-up">
            <div className="metric-card">
              <div className="muted">Akış</div>
              <strong>Sosyal feed + ilan kartları</strong>
            </div>
            <div className="metric-card">
              <div className="muted">Mesajlar</div>
              <strong>DM, grup, ilan pazarlığı</strong>
            </div>
            <div className="metric-card">
              <div className="muted">Loi AI</div>
              <strong>Piyasa, arıza, karşılaştırma</strong>
            </div>
          </div>
          <div className="soft-card" style={{ padding: 18 }}>
            <strong>Paylaşılabilir web linkleri</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              Carloi’de yayınlanan post, profil ve ilanlar artık web üzerinden açılabilir ve paylaşılabilir.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
