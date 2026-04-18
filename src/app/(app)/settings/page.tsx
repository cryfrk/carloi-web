'use client';

import { useState } from 'react';

import { useSession } from '@/providers/session-provider';

const supportItems = [
  {
    title: 'Genel İletişim',
    description: 'Ürün, marka ve genel iletişim konuları için.',
    email: 'info@carloi.com',
    subject: 'Carloi Genel İletişim',
  },
  {
    title: 'Destek',
    description: 'Hesap, giriş, ilan, ödeme ve teknik yardım talepleri için.',
    email: 'destek@carloi.com',
    subject: 'Carloi Destek Talebi',
  },
  {
    title: 'İş Birliği',
    description: 'Kurumsal anlaşma, partnerlik ve ticari görüşmeler için.',
    email: 'business@carloi.com',
    subject: 'Carloi İş Birliği',
  },
];

export default function SettingsPage() {
  const { snapshot, runSnapshotAction } = useSession();
  const [settings, setSettings] = useState(snapshot?.settings);
  if (!snapshot || !settings) return null;

  return (
    <>
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Ayarlar</div>
          <h1 style={{ margin: '8px 0 6px' }}>Hesap, güvenlik, gizlilik, destek</h1>
        </div>
      </section>

      <section className="glass-card" style={{ padding: 22, display: 'grid', gap: 18 }}>
        <div className="two-up">
          {[
            ['E-posta bildirimleri', 'emailNotifications'],
            ['SMS bildirimleri', 'smsNotifications'],
            ['Mesaj taleplerine izin ver', 'allowMessageRequests'],
            ['Son görülmeyi göster', 'showLastSeen'],
            ['İki adımlı doğrulama', 'twoFactorEnabled'],
            ['AI veri paylaşımı', 'aiDataSharing'],
            ['Hızlı giriş', 'quickLoginEnabled'],
            ['Satılan araç sayısını göster', 'showSoldCountOnProfile'],
          ].map(([label, key]) => (
            <label key={key} className="support-card" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <strong>{label}</strong>
                <div className="muted" style={{ marginTop: 6 }}>
                  Carloi web ve mobil davranışı birlikte güncellenir.
                </div>
              </div>
              <input
                type="checkbox"
                checked={Boolean((settings as unknown as Record<string, unknown>)[key])}
                onChange={(event) => setSettings((current) => ({ ...current!, [key]: event.target.checked }))}
              />
            </label>
          ))}
        </div>
        <button
          className="button button-primary"
          onClick={() =>
            runSnapshotAction('/api/profile/settings', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(settings),
            })
          }
        >
          Ayarları kaydet
        </button>
      </section>

      <section className="glass-card" style={{ padding: 22 }}>
        <div className="eyebrow">Destek ve İletişim</div>
        <h2 style={{ margin: '10px 0 6px' }}>Carloi Care</h2>
        <p className="muted">Sorun, öneri veya iş birliği talepleriniz için bizimle iletişime geçin.</p>
        <div className="support-grid" style={{ marginTop: 18 }}>
          {supportItems.map((item) => (
            <a
              key={item.email}
              className="support-card"
              href={`mailto:${item.email}?subject=${encodeURIComponent(item.subject)}`}
            >
              <div className="eyebrow">{item.title}</div>
              <strong style={{ display: 'block', marginTop: 8 }}>{item.email}</strong>
              <p className="muted" style={{ marginBottom: 0 }}>
                {item.description}
              </p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
