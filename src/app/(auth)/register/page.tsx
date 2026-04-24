'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthShell } from '@/components/auth-shell';
import {
  SIGNUP_CONSENT_VERSION,
  signupConsentDocuments,
  type SignupConsentKey,
} from '@/lib/legal-consents';
import { useSession } from '@/providers/session-provider';

const signupConsentItems = Object.keys(signupConsentDocuments) as SignupConsentKey[];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useSession();
  const [form, setForm] = useState({
    name: '',
    handle: '',
    bio: '',
    email: '',
    password: '',
  });
  const [accountType, setAccountType] = useState<'individual' | 'commercial'>('individual');
  const [commercialProfile, setCommercialProfile] = useState({
    companyName: '',
    taxOrIdentityType: 'VKN' as 'VKN' | 'TCKN',
    taxOrIdentityNumber: '',
  });
  const [consents, setConsents] = useState({
    terms_of_service: false,
    privacy_policy: false,
    content_responsibility: false,
    marketing_optional: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeConsent, setActiveConsent] = useState<SignupConsentKey | null>(null);
  const activeConsentDocument = activeConsent ? signupConsentDocuments[activeConsent] : null;

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      if (
        !consents.terms_of_service ||
        !consents.privacy_policy ||
        !consents.content_responsibility
      ) {
        setError('Kaydi tamamlamak icin zorunlu onay kutularini isaretlemelisin.');
        setLoading(false);
        return;
      }

      if (
        accountType === 'commercial' &&
        (!commercialProfile.companyName.trim() || !commercialProfile.taxOrIdentityNumber.trim())
      ) {
        setError('Ticari kayit icin sirket adi ve VKN/TCKN zorunludur.');
        setLoading(false);
        return;
      }

      const result = await register({
        ...form,
        accountType,
        consents: [
          {
            type: 'terms_of_service',
            accepted: true,
            version: SIGNUP_CONSENT_VERSION,
            sourceScreen: 'signup',
          },
          {
            type: 'privacy_policy',
            accepted: true,
            version: SIGNUP_CONSENT_VERSION,
            sourceScreen: 'signup',
          },
          {
            type: 'content_responsibility',
            accepted: true,
            version: SIGNUP_CONSENT_VERSION,
            sourceScreen: 'signup',
          },
          ...(consents.marketing_optional
            ? [
                {
                  type: 'marketing_optional' as const,
                  accepted: true,
                  version: SIGNUP_CONSENT_VERSION,
                  sourceScreen: 'signup',
                },
              ]
            : []),
        ],
        commercialProfile:
          accountType === 'commercial'
            ? {
                companyName: commercialProfile.companyName.trim(),
                taxOrIdentityType: commercialProfile.taxOrIdentityType,
                taxOrIdentityNumber: commercialProfile.taxOrIdentityNumber.trim(),
              }
            : undefined,
      });
      const params = new URLSearchParams({
        email: result.email || form.email,
      });
      if (result.message) {
        params.set('message', result.message);
      }
      if (result.deliveryFailed) {
        params.set('deliveryFailed', '1');
      }
      if (result.emailDisabled) {
        params.set('emailDisabled', '1');
      }
      if (result.emailNotConfigured) {
        params.set('emailNotConfigured', '1');
      }
      if (accountType === 'commercial') {
        params.set('intent', 'commercial');
      }
      router.push(`/verify-email?${params.toString()}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Kayit olunamadi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Carloi hesabi olustur"
      subtitle="Tek hesapla mobil ve web surumunde ayni sosyal akisa, ilanlara ve Loi AI alanina eris."
      alternateHref="/login"
      alternateLabel="Zaten hesabin var mi? Giris yap."
    >
      <div className="stack">
        <input
          className="input"
          placeholder="Ad soyad"
          value={form.name}
          onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
        />
        <input
          className="input"
          placeholder="@kullaniciadi"
          value={form.handle}
          onChange={(e) => setForm((current) => ({ ...current, handle: e.target.value }))}
        />
        <textarea
          className="textarea"
          placeholder="Kisa profil aciklamasi"
          value={form.bio}
          onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))}
        />
        <input
          className="input"
          placeholder="E-posta"
          value={form.email}
          onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
        />
        <input
          className="input"
          placeholder="Sifre"
          type="password"
          value={form.password}
          onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
        />
        <div className="support-grid">
          <button
            className={`button ${accountType === 'individual' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setAccountType('individual')}
            type="button"
          >
            Bireysel hesap
          </button>
          <button
            className={`button ${accountType === 'commercial' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setAccountType('commercial')}
            type="button"
          >
            Ticari hesap baslat
          </button>
        </div>
        {accountType === 'commercial' ? (
          <>
            <input
              className="input"
              placeholder="Sirket / isletme adi"
              value={commercialProfile.companyName}
              onChange={(e) =>
                setCommercialProfile((current) => ({ ...current, companyName: e.target.value }))
              }
            />
            <div className="support-grid">
              <button
                className={`button ${commercialProfile.taxOrIdentityType === 'VKN' ? 'button-primary' : 'button-secondary'}`}
                onClick={() =>
                  setCommercialProfile((current) => ({ ...current, taxOrIdentityType: 'VKN' }))
                }
                type="button"
              >
                VKN
              </button>
              <button
                className={`button ${commercialProfile.taxOrIdentityType === 'TCKN' ? 'button-primary' : 'button-secondary'}`}
                onClick={() =>
                  setCommercialProfile((current) => ({ ...current, taxOrIdentityType: 'TCKN' }))
                }
                type="button"
              >
                TCKN
              </button>
            </div>
            <input
              className="input"
              placeholder={`${commercialProfile.taxOrIdentityType} numarasi`}
              value={commercialProfile.taxOrIdentityNumber}
              onChange={(e) =>
                setCommercialProfile((current) => ({
                  ...current,
                  taxOrIdentityNumber: e.target.value,
                }))
              }
            />
            <div className="muted">
              E-posta dogrulamasindan sonra belge yukleme ekranina yonlendirilirsin. Basvuru platform incelemesine alinmadan ilan yayinlayamazsin.
            </div>
          </>
        ) : null}
        <div className="stack" style={{ gap: '0.75rem' }}>
          {signupConsentItems.map((key) => {
            const item = signupConsentDocuments[key];

            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={consents[key]}
                  onChange={(event) =>
                    setConsents((current) => ({
                      ...current,
                      [key]: event.target.checked,
                    }))
                  }
                  aria-label={item.checkboxLabel}
                />
                <div style={{ display: 'grid', gap: '0.35rem', flex: 1 }}>
                  <button
                    type="button"
                    onClick={() => setActiveConsent(key)}
                    style={{
                      padding: 0,
                      border: 'none',
                      background: 'none',
                      color: 'var(--text)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    {item.checkboxLabel}
                    {item.required ? ' *' : ''}
                  </button>
                  <span className="muted" style={{ fontSize: '0.85rem' }}>
                    {item.helperText}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveConsent(key)}
                    style={{
                      padding: 0,
                      border: 'none',
                      background: 'none',
                      color: 'var(--accent)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    {item.linkLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : null}
        <button className="button button-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Hesap olusturuluyor...' : 'Hesap olustur'}
        </button>
      </div>

      {activeConsentDocument ? (
        <div
          aria-labelledby="register-consent-title"
          aria-modal="true"
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16, 24, 32, 0.42)',
            display: 'grid',
            placeItems: 'center',
            padding: '1.5rem',
            zIndex: 50,
          }}
        >
          <button
            aria-label="Sozlesme penceresini kapat"
            onClick={() => setActiveConsent(null)}
            style={{
              position: 'absolute',
              inset: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
            type="button"
          />
          <div
            style={{
              position: 'relative',
              width: 'min(100%, 42rem)',
              maxHeight: '80vh',
              overflow: 'auto',
              borderRadius: '1.5rem',
              background: 'var(--surface-strong)',
              border: '1px solid var(--line)',
              padding: '1.5rem',
              display: 'grid',
              gap: '1rem',
              boxShadow: '0 24px 60px rgba(16, 24, 32, 0.16)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2
                id="register-consent-title"
                style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}
              >
                {activeConsentDocument.title}
              </h2>
              <button
                className="button button-secondary"
                onClick={() => setActiveConsent(null)}
                type="button"
              >
                Kapat
              </button>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div
                className="muted"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                Versiyon {activeConsentDocument.version} • Son güncelleme{' '}
                {activeConsentDocument.lastUpdated}
              </div>
              <div
                style={{
                  color: 'var(--accent)',
                  lineHeight: 1.65,
                  fontSize: '0.92rem',
                }}
              >
                {activeConsentDocument.legalDraftNotice}
              </div>
              {activeConsentDocument.sections.map((section) => (
                <section
                  key={section.heading}
                  style={{
                    display: 'grid',
                    gap: '0.6rem',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: 'var(--text)',
                      fontSize: '1rem',
                      fontWeight: 800,
                    }}
                  >
                    {section.heading}
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '1.15rem',
                      display: 'grid',
                      gap: '0.55rem',
                      color: 'var(--text)',
                      lineHeight: 1.65,
                    }}
                  >
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </AuthShell>
  );
}
