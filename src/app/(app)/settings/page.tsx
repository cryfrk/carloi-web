'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useSession } from '@/providers/session-provider';

const settingToggleFields: Array<{
  label: string;
  key:
    | 'emailNotifications'
    | 'smsNotifications'
    | 'allowMessageRequests'
    | 'showLastSeen'
    | 'twoFactorEnabled'
    | 'aiDataSharing'
    | 'quickLoginEnabled'
    | 'showSoldCountOnProfile';
}> = [
  { label: 'E-posta bildirimleri', key: 'emailNotifications' },
  { label: 'SMS bildirimleri', key: 'smsNotifications' },
  { label: 'Mesaj taleplerine izin ver', key: 'allowMessageRequests' },
  { label: 'Son gorulmeyi goster', key: 'showLastSeen' },
  { label: 'Iki adimli dogrulama', key: 'twoFactorEnabled' },
  { label: 'AI veri paylasimi', key: 'aiDataSharing' },
  { label: 'Hizli giris', key: 'quickLoginEnabled' },
  { label: 'Satilan arac sayisini goster', key: 'showSoldCountOnProfile' },
];

const supportItems = [
  {
    title: 'Genel Iletisim',
    description: 'Urun, marka ve genel iletisim konulari icin.',
    email: 'info@carloi.com',
    subject: 'Carloi Genel Iletisim',
  },
  {
    title: 'Destek',
    description: 'Hesap, giris, ilan, odeme ve teknik yardim talepleri icin.',
    email: 'destek@carloi.com',
    subject: 'Carloi Destek Talebi',
  },
  {
    title: 'Is Birligi',
    description: 'Kurumsal anlasma, partnerlik ve ticari gorusmeler icin.',
    email: 'business@carloi.com',
    subject: 'Carloi Is Birligi',
  },
];

export default function SettingsPage() {
  const { snapshot, runSnapshotAction } = useSession();
  const [settings, setSettings] = useState(snapshot?.settings);
  if (!snapshot || !settings) return null;

  const commercial = snapshot.commercial;

  return (
    <>
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Ayarlar</div>
          <h1 style={{ margin: '8px 0 6px' }}>Hesap, guvenlik, gizlilik, destek</h1>
        </div>
      </section>

      <section className="glass-card" style={{ padding: 22, display: 'grid', gap: 18 }}>
        <div className="two-up">
          {settingToggleFields.map(({ label, key }) => (
            <label
              key={key}
              className="support-card"
              style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}
            >
              <div>
                <strong>{label}</strong>
                <div className="muted" style={{ marginTop: 6 }}>
                  Carloi web ve mobil davranisi birlikte guncellenir.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(event) =>
                  setSettings((current) => ({ ...current!, [key]: event.target.checked }))
                }
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
          Ayarlari kaydet
        </button>
      </section>

      <section className="glass-card" style={{ padding: 22 }}>
        <div className="eyebrow">Ticari Hesap</div>
        <h2 style={{ margin: '10px 0 6px' }}>Commercial onboarding</h2>
        <p className="muted">
          {commercial.enabled
            ? 'Bireysel hesapla devam edebilir veya ticari hesaba gecerek belge yukleme ve platform inceleme surecini baslatabilirsin.'
            : 'Ticari hesap onboarding ozelligi su anda asamali olarak aciliyor.'}
        </p>
        <div className="support-grid" style={{ marginTop: 18 }}>
          <div className="support-card">
            <div className="eyebrow">Durum</div>
            <strong style={{ display: 'block', marginTop: 8 }}>
              {commercial.commercialStatus === 'not_applied'
                ? 'Basvuru baslatilmadi'
                : commercial.commercialStatus}
            </strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {commercial.canUseCommercialListingFeatures
                ? 'Ticari listing yetkileri platform incelemesiyle acildi.'
                : 'Ek dogrulama gerekebilir. Ticari ayricaliklar yalnizca platform inceleme onayi sonrasinda acilir.'}
            </p>
          </div>
          <div className="support-card">
            <div className="eyebrow">Belge seti</div>
            <strong style={{ display: 'block', marginTop: 8 }}>
              {commercial.minimumDocumentSet.hasMinimumSet ? 'Hazir' : 'Eksik belge var'}
            </strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              Vergi belgesi ve yetki belgeleri bir kez yuklenir, sonrasi artimsal guncelleme ile ilerler.
            </p>
          </div>
        </div>
        <Link
          className="button button-primary"
          href="/settings/commercial"
          style={{ display: 'inline-flex', marginTop: 18 }}
        >
          Ticari hesap ekranini ac
        </Link>
      </section>

      <section className="glass-card" style={{ padding: 22 }}>
        <div className="eyebrow">Destek ve Iletisim</div>
        <h2 style={{ margin: '10px 0 6px' }}>Carloi Care</h2>
        <p className="muted">
          Sorun, onerı veya is birligi talepleriniz icin bizimle iletisime gecin.
        </p>
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
