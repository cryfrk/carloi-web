'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AuthShell } from '@/components/auth-shell';
import {
  SIGNUP_CONSENT_VERSION,
  signupConsentDocuments,
  type SignupConsentKey,
} from '@/lib/legal-consents';
import { useSession } from '@/providers/session-provider';

const signupConsentItems = Object.keys(signupConsentDocuments) as SignupConsentKey[];

type RegisterStep = 'account_type' | 'identity' | 'details' | 'verification';
type AccountType = 'individual' | 'commercial';
type PrimaryChannel = 'email' | 'phone';

const stepMeta: Array<{ key: RegisterStep; title: string; helper: string }> = [
  {
    key: 'account_type',
    title: 'Hesap tipi',
    helper: 'Bireysel mi yoksa ticari hesapla mi ilerleyecegini sec.',
  },
  {
    key: 'identity',
    title: 'Ana kimlik',
    helper: 'Hesabinin temel giris bilgisini e-posta veya telefon olarak belirle.',
  },
  {
    key: 'details',
    title: 'Temel bilgiler',
    helper: 'Profil bilgilerini ve guvenli sifreni tamamla.',
  },
  {
    key: 'verification',
    title: 'Dogrulama',
    helper: 'Secilen kanala gore son guvenlik adimini tamamla.',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, startVerification } = useSession();
  const [step, setStep] = useState<RegisterStep>('account_type');
  const [accountType, setAccountType] = useState<AccountType>('individual');
  const [primaryChannel, setPrimaryChannel] = useState<PrimaryChannel>('email');
  const [form, setForm] = useState({
    name: '',
    handle: '',
    bio: '',
    email: '',
    phone: '',
    password: '',
  });
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
  const [activeConsent, setActiveConsent] = useState<SignupConsentKey | null>(null);
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [maskedDestination, setMaskedDestination] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const activeConsentDocument = activeConsent ? signupConsentDocuments[activeConsent] : null;
  const currentStepIndex = stepMeta.findIndex((item) => item.key === step);
  const requiredContact = primaryChannel === 'phone' ? form.phone.trim() : form.email.trim();

  const canContinueFromDetails = useMemo(() => {
    if (!form.name.trim() || !form.handle.trim() || !form.password.trim()) {
      return false;
    }

    if (primaryChannel === 'email' && !form.email.trim()) {
      return false;
    }

    if (primaryChannel === 'phone' && !form.phone.trim()) {
      return false;
    }

    if (
      accountType === 'commercial' &&
      (!commercialProfile.companyName.trim() || !commercialProfile.taxOrIdentityNumber.trim())
    ) {
      return false;
    }

    return true;
  }, [accountType, commercialProfile, form, primaryChannel]);

  function moveToNextStep() {
    setError('');
    setStatus('');

    if (step === 'account_type') {
      setStep('identity');
      return;
    }

    if (step === 'identity') {
      setStep('details');
      return;
    }

    if (step === 'details') {
      if (!canContinueFromDetails) {
        setError('Lutfen devam etmeden once zorunlu alanlari tamamlayin.');
        return;
      }
      setStep('verification');
    }
  }

  function moveToPreviousStep() {
    setError('');
    setStatus('');

    if (step === 'verification') {
      setStep('details');
      return;
    }

    if (step === 'details') {
      setStep('identity');
      return;
    }

    if (step === 'identity') {
      setStep('account_type');
    }
  }

  async function handleSendPhoneCode() {
    if (!form.phone.trim()) {
      setError('SMS kodu gonderebilmek icin once telefon numarasi girin.');
      return;
    }

    setSendingCode(true);
    setError('');
    setStatus('');
    try {
      const result = await startVerification({
        channel: 'phone',
        destination: form.phone.trim(),
      });

      setPhoneCodeSent(true);
      setMaskedDestination(result.maskedDestination || form.phone.trim());
      setVerificationMessage(result.message || 'SMS dogrulama kodu gonderildi.');
      setStatus(result.message || 'SMS dogrulama kodu gonderildi.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'SMS dogrulama kodu gonderilemedi.');
    } finally {
      setSendingCode(false);
    }
  }

  async function handleSubmit() {
    setError('');
    setStatus('');

    if (!consents.terms_of_service || !consents.privacy_policy || !consents.content_responsibility) {
      setError('Kaydi tamamlamak icin zorunlu sozlesmeleri kabul etmelisiniz.');
      return;
    }

    if (form.password.trim().length < 8) {
      setError('Sifre en az 8 karakter olmalidir.');
      return;
    }

    if (primaryChannel === 'phone' && !phoneCode.trim()) {
      setError('Telefon ile kayit icin SMS kodunu girmelisiniz.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({
        name: form.name.trim(),
        handle: form.handle.trim(),
        bio: form.bio.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password.trim(),
        primaryChannel,
        signupVerification: primaryChannel === 'phone' ? { code: phoneCode.trim() } : undefined,
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

      if (result.snapshot && result.verificationChannel === 'phone') {
        router.push(accountType === 'commercial' ? '/settings/commercial' : '/feed');
        return;
      }

      const params = new URLSearchParams();
      if (result.email || form.email.trim()) {
        params.set('email', result.email || form.email.trim());
      }
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
      setError(cause instanceof Error ? cause.message : 'Kayit islemi tamamlanamadi.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Carloi hesabini olustur"
      subtitle="Tek bir hesapla feed, ilanlar, mesajlar, ticari onboarding ve guvenli odeme akislari web ile mobilde ayni sekilde senkron calissin."
      alternateHref="/login"
      alternateLabel="Zaten hesabin var mi? Giris yap."
    >
      <div className="auth-step-list">
        {stepMeta.map((item, index) => (
          <div
            key={item.key}
            className={`auth-step-chip ${index <= currentStepIndex ? 'active' : ''}`}
          >
            <span>{index + 1}</span>
            <div>
              <strong>{item.title}</strong>
              <small>{item.helper}</small>
            </div>
          </div>
        ))}
      </div>

      {step === 'account_type' ? (
        <div className="stack">
          <div className="choice-grid">
            <button
              className={`choice-card ${accountType === 'individual' ? 'active' : ''}`}
              onClick={() => setAccountType('individual')}
              type="button"
            >
              <div className="eyebrow">Bireysel kullanici</div>
              <strong>Hizli kayit, sosyal feed ve ilan deneyimi</strong>
              <p className="muted">
                Arac paylasimi, mesajlasma ve sosyal akisa hemen katilin.
              </p>
            </button>
            <button
              className={`choice-card ${accountType === 'commercial' ? 'active' : ''}`}
              onClick={() => setAccountType('commercial')}
              type="button"
            >
              <div className="eyebrow">Ticari kullanici</div>
              <strong>Belge yukleme ve platform incelemesi ile ilerler</strong>
              <p className="muted">
                Sirket bilgileriyle kaydolun, dogrulama sonrasi ticari ilan yetkileri acilsin.
              </p>
            </button>
          </div>
        </div>
      ) : null}

      {step === 'identity' ? (
        <div className="stack">
          <div className="choice-grid">
            <button
              className={`choice-card ${primaryChannel === 'email' ? 'active' : ''}`}
              onClick={() => setPrimaryChannel('email')}
              type="button"
            >
              <div className="eyebrow">E-posta ile kayit</div>
              <strong>Dogrulama baglantisi mail adresine gider</strong>
              <p className="muted">
                Produksiyonda dogrulama linki www.carloi.com alanina yonlenir.
              </p>
            </button>
            <button
              className={`choice-card ${primaryChannel === 'phone' ? 'active' : ''}`}
              onClick={() => setPrimaryChannel('phone')}
              type="button"
            >
              <div className="eyebrow">Telefon ile kayit</div>
              <strong>5 dakika gecerli SMS kodu ile tamamlanir</strong>
              <p className="muted">
                Telefon ana giris kimliginiz olur; e-postayi sonradan ayarlardan ekleyebilirsiniz.
              </p>
            </button>
          </div>
        </div>
      ) : null}

      {step === 'details' ? (
        <div className="stack">
          <div className="form-grid">
            <label className="stack">
              <span className="field-label">Ad soyad</span>
              <input
                className="input"
                placeholder="Ad soyad"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="stack">
              <span className="field-label">Kullanici adi</span>
              <input
                className="input"
                placeholder="@kullaniciadi"
                value={form.handle}
                onChange={(event) => setForm((current) => ({ ...current, handle: event.target.value }))}
              />
            </label>
            <label className="stack">
              <span className="field-label">{primaryChannel === 'phone' ? 'Telefon' : 'E-posta'}</span>
              <input
                className="input"
                placeholder={primaryChannel === 'phone' ? '+90 5xx xxx xx xx' : 'eposta@ornek.com'}
                value={primaryChannel === 'phone' ? form.phone : form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [primaryChannel === 'phone' ? 'phone' : 'email']: event.target.value,
                  }))
                }
              />
            </label>
            <label className="stack">
              <span className="field-label">Sifre</span>
              <input
                className="input"
                placeholder="En az 8 karakter"
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
          </div>

          <label className="stack">
            <span className="field-label">Kisa profil aciklamasi</span>
            <textarea
              className="textarea"
              placeholder="Arac ilgini, kullanim tarzinizi veya profil notunu kisaca yaz."
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
            />
          </label>

          {accountType === 'commercial' ? (
            <section className="soft-card wizard-panel">
              <div className="eyebrow">Ticari hesap bilgileri</div>
              <div className="form-grid" style={{ marginTop: 14 }}>
                <label className="stack">
                  <span className="field-label">Sirket / isletme adi</span>
                  <input
                    className="input"
                    placeholder="Carloi Otomotiv"
                    value={commercialProfile.companyName}
                    onChange={(event) =>
                      setCommercialProfile((current) => ({
                        ...current,
                        companyName: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="stack">
                  <span className="field-label">Vergi tipi</span>
                  <select
                    className="input"
                    value={commercialProfile.taxOrIdentityType}
                    onChange={(event) =>
                      setCommercialProfile((current) => ({
                        ...current,
                        taxOrIdentityType: event.target.value as 'VKN' | 'TCKN',
                      }))
                    }
                  >
                    <option value="VKN">VKN</option>
                    <option value="TCKN">TCKN</option>
                  </select>
                </label>
                <label className="stack">
                  <span className="field-label">Vergi no / TCKN</span>
                  <input
                    className="input"
                    placeholder={commercialProfile.taxOrIdentityType}
                    value={commercialProfile.taxOrIdentityNumber}
                    onChange={(event) =>
                      setCommercialProfile((current) => ({
                        ...current,
                        taxOrIdentityNumber: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <p className="muted" style={{ marginBottom: 0 }}>
                Belge yukleme ve inceleme sureci, hesap dogrulandiktan sonra ticari ayarlar ekraninda devam eder.
              </p>
            </section>
          ) : null}
        </div>
      ) : null}

      {step === 'verification' ? (
        <div className="stack">
          <section className="soft-card wizard-panel">
            <div className="eyebrow">Kayit ozeti</div>
            <div className="support-grid" style={{ marginTop: 14 }}>
              <div className="support-card">
                <div className="eyebrow">Hesap</div>
                <strong>{accountType === 'commercial' ? 'Ticari' : 'Bireysel'}</strong>
                <p className="muted" style={{ marginBottom: 0 }}>
                  Ana kimlik: {primaryChannel === 'phone' ? 'Telefon' : 'E-posta'}
                </p>
              </div>
              <div className="support-card">
                <div className="eyebrow">Hedef</div>
                <strong>{requiredContact || 'Belirtilmedi'}</strong>
                <p className="muted" style={{ marginBottom: 0 }}>
                  Kayit ve guvenlik bildirimleri bu kanal uzerinden ilerler.
                </p>
              </div>
            </div>
          </section>

          {primaryChannel === 'phone' ? (
            <section className="soft-card wizard-panel">
              <div className="eyebrow">SMS dogrulamasi</div>
              <div className="stack" style={{ marginTop: 14 }}>
                <p className="muted" style={{ margin: 0 }}>
                  Telefon numaraniza 6 haneli bir Carloi kodu gonderelim, ardindan hesabi dogrudan aktif edelim.
                </p>
                <div className="post-actions">
                  <button
                    className="button button-secondary"
                    disabled={sendingCode}
                    onClick={handleSendPhoneCode}
                    type="button"
                  >
                    {sendingCode ? 'Kod gonderiliyor...' : phoneCodeSent ? 'Kodu tekrar gonder' : 'SMS kodu gonder'}
                  </button>
                  {maskedDestination ? <span className="tag">{maskedDestination}</span> : null}
                </div>
                <label className="stack">
                  <span className="field-label">SMS kodu</span>
                  <input
                    className="input"
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    value={phoneCode}
                    onChange={(event) => setPhoneCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </label>
                {verificationMessage ? <div className="muted">{verificationMessage}</div> : null}
              </div>
            </section>
          ) : (
            <section className="soft-card wizard-panel">
              <div className="eyebrow">E-posta dogrulamasi</div>
              <p className="muted" style={{ margin: 0 }}>
                Kaydi tamamladiginiz anda hesap olusturulur ve dogrulama baglantisi <strong>{form.email.trim()}</strong>{' '}
                adresine gonderilir. Link her zaman <strong>www.carloi.com</strong> alaninda acilir.
              </p>
            </section>
          )}

          <section className="soft-card wizard-panel">
            <div className="eyebrow">Sozlesmeler</div>
            <div className="stack" style={{ marginTop: 14 }}>
              {signupConsentItems.map((key) => {
                const item = signupConsentDocuments[key];
                return (
                  <label key={key} className="consent-row">
                    <input
                      type="checkbox"
                      checked={consents[key]}
                      onChange={(event) =>
                        setConsents((current) => ({
                          ...current,
                          [key]: event.target.checked,
                        }))
                      }
                    />
                    <div>
                      <button
                        type="button"
                        className="consent-link"
                        onClick={() => setActiveConsent(key)}
                      >
                        {item.checkboxLabel}
                        {item.required ? ' *' : ''}
                      </button>
                      <div className="muted">{item.helperText}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}

      {status ? <div className="status-banner success">{status}</div> : null}
      {error ? <div className="status-banner error">{error}</div> : null}

      <div className="post-actions" style={{ marginTop: 18 }}>
        {step !== 'account_type' ? (
          <button className="button button-secondary" onClick={moveToPreviousStep} type="button">
            Geri
          </button>
        ) : null}
        {step !== 'verification' ? (
          <button className="button button-primary" onClick={moveToNextStep} type="button">
            Devam et
          </button>
        ) : (
          <button className="button button-primary" disabled={submitting} onClick={handleSubmit} type="button">
            {submitting
              ? 'Kayit tamamlanıyor...'
              : primaryChannel === 'phone'
                ? 'Hesabi olustur ve SMS ile dogrula'
                : 'Hesabi olustur ve baglanti gonder'}
          </button>
        )}
      </div>

      {activeConsentDocument ? (
        <div
          aria-labelledby="register-consent-title"
          aria-modal="true"
          role="dialog"
          className="consent-modal"
        >
          <button
            aria-label="Sozlesme penceresini kapat"
            onClick={() => setActiveConsent(null)}
            className="consent-modal-overlay"
            type="button"
          />
          <div className="consent-modal-card">
            <div className="consent-modal-header">
              <h2 id="register-consent-title">{activeConsentDocument.title}</h2>
              <button className="button button-secondary" onClick={() => setActiveConsent(null)} type="button">
                Kapat
              </button>
            </div>
            <div className="stack">
              <div className="muted">
                Versiyon {activeConsentDocument.version} • Son guncelleme {activeConsentDocument.lastUpdated}
              </div>
              <div className="status-banner warning">{activeConsentDocument.legalDraftNotice}</div>
              {activeConsentDocument.sections.map((section) => (
                <section key={section.heading} className="stack" style={{ gap: 10 }}>
                  <h3 style={{ margin: 0 }}>{section.heading}</h3>
                  <ul className="admin-bullet-list">
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
