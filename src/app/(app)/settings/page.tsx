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
  { label: 'Son gorulme bilgisini goster', key: 'showLastSeen' },
  { label: 'Iki adimli dogrulama', key: 'twoFactorEnabled' },
  { label: 'Loi AI veri paylasimi', key: 'aiDataSharing' },
  { label: 'Hizli giris', key: 'quickLoginEnabled' },
  { label: 'Satilan arac sayisini profilde goster', key: 'showSoldCountOnProfile' },
];

export default function SettingsPage() {
  const { snapshot, runSnapshotAction } = useSession();
  const [settings, setSettings] = useState(snapshot?.settings);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  if (!snapshot || !settings) return null;

  const commercial = snapshot.commercial;

  async function handleSave() {
    setStatusMessage('');
    setError('');
    try {
      const response = await runSnapshotAction('/api/profile/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setStatusMessage(response.message || 'Ayarlariniz guncellendi.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Ayarlar kaydedilemedi.');
    }
  }

  return (
    <>
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Ayarlar</div>
          <h1>Hesap, guvenlik ve destek</h1>
          <p className="muted">
            E-posta ile uye olduysan telefonunu, telefon ile uye olduysan e-posta adresini
            buradan ekleyebilirsin.
          </p>
        </div>
      </section>

      <section className="glass-card" style={{ padding: 22, display: 'grid', gap: 18 }}>
        <div className="support-grid">
          <label className="support-card stack">
            <span className="field-label">E-posta</span>
            <input
              className="input"
              placeholder="eposta@ornek.com"
              value={settings.email}
              onChange={(event) => setSettings((current) => ({ ...current!, email: event.target.value }))}
            />
          </label>
          <label className="support-card stack">
            <span className="field-label">Telefon</span>
            <input
              className="input"
              placeholder="+90 5xx xxx xx xx"
              value={settings.phone}
              onChange={(event) => setSettings((current) => ({ ...current!, phone: event.target.value }))}
            />
          </label>
        </div>

        <div className="support-grid">
          {settingToggleFields.map(({ label, key }) => (
            <label key={key} className="support-card toggle-card">
              <div>
                <strong>{label}</strong>
                <div className="muted">Web ve mobil deneyimi ayni backend kaydi uzerinden guncellenir.</div>
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

        <div className="post-actions">
          <button className="button button-primary" onClick={handleSave} type="button">
            Ayarlari kaydet
          </button>
          <Link className="button button-secondary" href="/settings/commercial">
            Ticari hesap alani
          </Link>
        </div>

        {statusMessage ? <div className="status-banner success">{statusMessage}</div> : null}
        {error ? <div className="status-banner error">{error}</div> : null}
      </section>

      <section className="glass-card" style={{ padding: 22 }}>
        <div className="eyebrow">Ticari hesap</div>
        <div className="support-grid" style={{ marginTop: 14 }}>
          <div className="support-card">
            <strong>Durum</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {commercial.commercialStatus}
            </p>
          </div>
          <div className="support-card">
            <strong>Belge seti</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {commercial.minimumDocumentSet.hasMinimumSet ? 'Hazir' : 'Eksik belge var'}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
