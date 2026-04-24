'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { webFeatureFlags } from '@/lib/feature-flags';
import type {
  CommercialDocumentType,
  CommercialProfileSummary,
} from '@/lib/types';
import { useSession } from '@/providers/session-provider';

const DOCUMENT_TYPE_OPTIONS: { value: CommercialDocumentType; label: string }[] = [
  { value: 'tax_document', label: 'Vergi belgesi' },
  { value: 'authorization_certificate', label: 'Yetki belgesi' },
  { value: 'trade_registry', label: 'Ticaret sicil / oda belgesi' },
  { value: 'identity_document', label: 'Kimlik belgesi' },
  { value: 'other', label: 'Diger belge' },
];

const STEP_TITLES = [
  'Hesap tipi',
  'Sirket bilgileri',
  'Belge yukleme',
  'Beyanlar',
  'Ozeti kontrol et',
  'Durum',
];

function buildProfileDraft(profile?: CommercialProfileSummary | null) {
  return {
    companyName: profile?.companyName || '',
    taxOrIdentityType: profile?.taxOrIdentityType || 'VKN',
    taxOrIdentityNumber: profile?.taxOrIdentityNumber || '',
    tradeName: profile?.tradeName || '',
    mersisNumber: profile?.mersisNumber || '',
    authorizedPersonName: profile?.authorizedPersonName || '',
    authorizedPersonTitle: profile?.authorizedPersonTitle || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    district: profile?.district || '',
    address: profile?.address || '',
    notes: profile?.notes || '',
  };
}

async function uploadCommercialFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kind', 'report');

  const response = await fetch('/api/proxy/api/media/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const data = (await response.json()) as { success?: boolean; message?: string; url?: string };
  if (!response.ok || !data.success || !data.url) {
    throw new Error(data.message || 'Belge yuklenemedi.');
  }

  return data.url;
}

export default function CommercialSettingsPage() {
  const { snapshot, runSnapshotAction, refresh } = useSession();
  const commercial = snapshot?.commercial;
  const [step, setStep] = useState(0);
  const [accountTypeSelection, setAccountTypeSelection] = useState<'individual' | 'commercial'>(
    commercial?.accountType === 'commercial' || commercial?.profile ? 'commercial' : 'individual',
  );
  const [profileDraft, setProfileDraft] = useState(buildProfileDraft(commercial?.profile));
  const [documentType, setDocumentType] = useState<CommercialDocumentType>('tax_document');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [declarations, setDeclarations] = useState({
    commercialDeclarationAccepted: false,
    documentTruthfulnessAccepted: false,
    additionalVerificationAcknowledged: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!commercial) {
      return;
    }
    setProfileDraft(buildProfileDraft(commercial.profile));
    setAccountTypeSelection(
      commercial.accountType === 'commercial' || commercial.profile ? 'commercial' : 'individual',
    );
    setDeclarations((current) => ({
      ...current,
      commercialDeclarationAccepted: Boolean(commercial.profile),
      documentTruthfulnessAccepted: Boolean(
        commercial.profile?.documentTruthfulnessAcceptedAt,
      ),
      additionalVerificationAcknowledged: Boolean(
        commercial.profile?.additionalVerificationAcknowledgedAt,
      ),
    }));
  }, [commercial]);

  const canSubmit = useMemo(() => {
    return (
      accountTypeSelection === 'commercial' &&
      declarations.commercialDeclarationAccepted &&
      declarations.documentTruthfulnessAccepted &&
      declarations.additionalVerificationAcknowledged &&
      Boolean(commercial?.minimumDocumentSet.hasMinimumSet)
    );
  }, [accountTypeSelection, commercial?.minimumDocumentSet.hasMinimumSet, declarations]);

  if (!snapshot || !commercial) {
    return null;
  }

  async function handleSaveDraft() {
    setSubmitting(true);
    setError('');
    setStatusMessage('');
    try {
      const response = await runSnapshotAction('/api/commercial/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileDraft),
      });
      setStatusMessage(response.message || 'Ticari hesap taslagi kaydedildi.');
      setStep((current) => Math.max(current, 2));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Taslak kaydedilemedi.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUploadDocument() {
    if (!documentFile) {
      setError('Lutfen bir belge sec.');
      return;
    }

    setSubmitting(true);
    setError('');
    setStatusMessage('');
    try {
      const fileUrl = await uploadCommercialFile(documentFile);
      const response = await runSnapshotAction('/api/commercial/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: documentType,
          fileUrl,
          originalFileName: documentFile.name,
          mimeType: documentFile.type || 'application/pdf',
          fileSize: documentFile.size,
        }),
      });
      setDocumentFile(null);
      setStatusMessage(response.message || 'Belge yuklendi.');
      setStep((current) => Math.max(current, 3));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Belge yuklenemedi.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    setStatusMessage('');
    try {
      const response = await runSnapshotAction('/api/commercial/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileDraft,
          consents: [
            {
              type: 'commercial_declaration',
              accepted: true,
              version: '2026-04',
              sourceScreen: 'commercial_onboarding',
            },
          ],
          declarations: {
            documentTruthfulnessAccepted: declarations.documentTruthfulnessAccepted,
            additionalVerificationAcknowledged:
              declarations.additionalVerificationAcknowledged,
          },
        }),
      });
      setStatusMessage(
        response.message ||
          'Ticari hesap basvurusu platform incelemesine gonderildi.',
      );
      await refresh();
      setStep(5);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Basvuru gonderilemedi.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Ticari Hesap</div>
          <h1 style={{ margin: '8px 0 6px' }}>Commercial onboarding v2</h1>
          <p className="muted" style={{ margin: 0 }}>
            Bireysel hesapla devam edebilir veya ticari hesaba gecerek belge yukleme,
            beyan ve platform inceleme surecini takip edebilirsin.
          </p>
        </div>
      </section>

      {!webFeatureFlags.enableCommercialOnboarding ? (
        <section className="glass-card" style={{ padding: 22 }}>
          <div className="eyebrow">Kapali</div>
          <h2 style={{ margin: '10px 0 6px' }}>Ozellik asamali olarak aciliyor</h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            Ticari hesap onboarding su anda feature flag arkasinda. Hazir oldugunda bu
            ekrandan kullanilabilecek.
          </p>
        </section>
      ) : (
        <>
          <section className="glass-card" style={{ padding: 22 }}>
            <div className="eyebrow">Adimlar</div>
            <div className="support-grid" style={{ marginTop: 14 }}>
              {STEP_TITLES.map((title, index) => (
                <button
                  key={title}
                  className={`button ${step === index ? 'button-primary' : 'button-secondary'}`}
                  onClick={() => setStep(index)}
                  type="button"
                >
                  {index + 1}. {title}
                </button>
              ))}
            </div>
          </section>

          <section className="glass-card" style={{ padding: 22, display: 'grid', gap: 18 }}>
            {step === 0 ? (
              <>
                <div className="eyebrow">1. Hesap tipi</div>
                <div className="support-grid">
                  <button
                    className={`support-card${accountTypeSelection === 'individual' ? ' active-card' : ''}`}
                    type="button"
                    onClick={() => setAccountTypeSelection('individual')}
                  >
                    <div className="eyebrow">Bireysel</div>
                    <strong style={{ display: 'block', marginTop: 8 }}>Daha az adim</strong>
                    <p className="muted" style={{ marginBottom: 0 }}>
                      Mevcut hesabin bireysel modda kalir. Ticari belge incelemesi gerekmez.
                    </p>
                  </button>
                  <button
                    className={`support-card${accountTypeSelection === 'commercial' ? ' active-card' : ''}`}
                    type="button"
                    onClick={() => setAccountTypeSelection('commercial')}
                  >
                    <div className="eyebrow">Ticari</div>
                    <strong style={{ display: 'block', marginTop: 8 }}>
                      Platform review gerekir
                    </strong>
                    <p className="muted" style={{ marginBottom: 0 }}>
                      Sirket bilgileri, belge yukleme ve platform inceleme sureci ile ilerler.
                    </p>
                  </button>
                </div>
                {accountTypeSelection === 'individual' ? (
                  <p className="muted" style={{ marginBottom: 0 }}>
                    Bireysel hesapla devam edebilirsin. Ticari hesaba gecmek istersen bu adimi daha sonra tekrar acabilirsin.
                  </p>
                ) : null}
              </>
            ) : null}

            {step === 1 ? (
              <>
                <div className="eyebrow">2. Sirket bilgileri</div>
                <div className="two-up">
                  <input className="input" placeholder="Sirket / isletme adi" value={profileDraft.companyName} onChange={(event) => setProfileDraft((current) => ({ ...current, companyName: event.target.value }))} />
                  <select className="input" value={profileDraft.taxOrIdentityType} onChange={(event) => setProfileDraft((current) => ({ ...current, taxOrIdentityType: event.target.value as 'VKN' | 'TCKN' }))}>
                    <option value="VKN">VKN</option>
                    <option value="TCKN">TCKN</option>
                  </select>
                  <input className="input" placeholder="Vergi / kimlik numarasi" value={profileDraft.taxOrIdentityNumber} onChange={(event) => setProfileDraft((current) => ({ ...current, taxOrIdentityNumber: event.target.value }))} />
                  <input className="input" placeholder="Ticari unvan (opsiyonel)" value={profileDraft.tradeName} onChange={(event) => setProfileDraft((current) => ({ ...current, tradeName: event.target.value }))} />
                  <input className="input" placeholder="MERSIS numarasi (opsiyonel)" value={profileDraft.mersisNumber} onChange={(event) => setProfileDraft((current) => ({ ...current, mersisNumber: event.target.value }))} />
                  <input className="input" placeholder="Yetkili kisi" value={profileDraft.authorizedPersonName} onChange={(event) => setProfileDraft((current) => ({ ...current, authorizedPersonName: event.target.value }))} />
                  <input className="input" placeholder="Yetkili unvani" value={profileDraft.authorizedPersonTitle} onChange={(event) => setProfileDraft((current) => ({ ...current, authorizedPersonTitle: event.target.value }))} />
                  <input className="input" placeholder="Telefon" value={profileDraft.phone} onChange={(event) => setProfileDraft((current) => ({ ...current, phone: event.target.value }))} />
                  <input className="input" placeholder="Sehir" value={profileDraft.city} onChange={(event) => setProfileDraft((current) => ({ ...current, city: event.target.value }))} />
                  <input className="input" placeholder="Ilce" value={profileDraft.district} onChange={(event) => setProfileDraft((current) => ({ ...current, district: event.target.value }))} />
                </div>
                <textarea className="textarea" placeholder="Acik adres" value={profileDraft.address} onChange={(event) => setProfileDraft((current) => ({ ...current, address: event.target.value }))} />
                <textarea className="textarea" placeholder="Notlar (opsiyonel)" value={profileDraft.notes} onChange={(event) => setProfileDraft((current) => ({ ...current, notes: event.target.value }))} />
                <button className="button button-primary" type="button" onClick={handleSaveDraft} disabled={submitting}>
                  {submitting ? 'Taslak kaydediliyor...' : 'Sirket bilgilerini kaydet'}
                </button>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="eyebrow">3. Belge yukleme</div>
                <p className="muted">
                  Belgeler bir kez yuklenir ve platform inceleme surecinde kullanilir. Gerekirse ek belge sonradan eklenebilir.
                </p>
                <div className="two-up">
                  <select className="input" value={documentType} onChange={(event) => setDocumentType(event.target.value as CommercialDocumentType)}>
                    {DOCUMENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input className="input" type="file" accept=".pdf,image/*" onChange={(event) => setDocumentFile(event.target.files?.[0] || null)} />
                </div>
                <button className="button button-primary" type="button" onClick={handleUploadDocument} disabled={submitting}>
                  {submitting ? 'Belge yukleniyor...' : 'Belge yukle'}
                </button>
                <div className="support-grid">
                  {commercial.documents.map((document) => (
                    <a key={document.id} className="support-card" href={document.fileUrl} target="_blank" rel="noreferrer">
                      <div className="eyebrow">{document.type}</div>
                      <strong style={{ display: 'block', marginTop: 8 }}>{document.originalFileName}</strong>
                      <p className="muted" style={{ marginBottom: 0 }}>
                        {document.status}
                        {document.suspiciousFlag ? ' · additional verification required' : ''}
                      </p>
                    </a>
                  ))}
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="eyebrow">4. Beyanlar ve kabuller</div>
                <label className="support-card" style={{ display: 'flex', gap: 12 }}>
                  <input type="checkbox" checked={declarations.commercialDeclarationAccepted} onChange={(event) => setDeclarations((current) => ({ ...current, commercialDeclarationAccepted: event.target.checked }))} />
                  <div>
                    <strong>Ticari beyan</strong>
                    <div className="muted">
                      Yuklenen bilgilerin hesap sahibi tarafindan beyan edildigini kabul ederim.
                    </div>
                  </div>
                </label>
                <label className="support-card" style={{ display: 'flex', gap: 12 }}>
                  <input type="checkbox" checked={declarations.documentTruthfulnessAccepted} onChange={(event) => setDeclarations((current) => ({ ...current, documentTruthfulnessAccepted: event.target.checked }))} />
                  <div>
                    <strong>Belge dogrulugu</strong>
                    <div className="muted">
                      Yuklenen belgelerin guncel ve gercegi yansittigini beyan ederim.
                    </div>
                  </div>
                </label>
                <label className="support-card" style={{ display: 'flex', gap: 12 }}>
                  <input type="checkbox" checked={declarations.additionalVerificationAcknowledged} onChange={(event) => setDeclarations((current) => ({ ...current, additionalVerificationAcknowledged: event.target.checked }))} />
                  <div>
                    <strong>Ek dogrulama onayi</strong>
                    <div className="muted">
                      Platform gerekli gordugunde ek belge veya aciklama isteyebilecegini kabul ederim.
                    </div>
                  </div>
                </label>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <div className="eyebrow">5. Ozet ve gonderim</div>
                <div className="support-grid">
                  <div className="support-card">
                    <div className="eyebrow">Profil</div>
                    <strong style={{ display: 'block', marginTop: 8 }}>{profileDraft.companyName || 'Eksik'}</strong>
                    <p className="muted" style={{ marginBottom: 0 }}>
                      {profileDraft.taxOrIdentityType} · {profileDraft.taxOrIdentityNumber || 'Numara bekleniyor'}
                    </p>
                  </div>
                  <div className="support-card">
                    <div className="eyebrow">Belge durumu</div>
                    <strong style={{ display: 'block', marginTop: 8 }}>
                      {commercial.minimumDocumentSet.hasMinimumSet ? 'Minimum set hazir' : 'Eksik belge var'}
                    </strong>
                    <p className="muted" style={{ marginBottom: 0 }}>
                      {commercial.documents.length} belge yuklendi
                    </p>
                  </div>
                </div>
                <p className="muted">
                  Basvuru gonderildiginde durumun `pending review` olarak izlenir. Onay, red veya ek dogrulama sonucu burada gorunur.
                </p>
                <button className="button button-primary" type="button" onClick={handleSubmit} disabled={submitting || !canSubmit}>
                  {submitting ? 'Basvuru gonderiliyor...' : 'Platform incelemesine gonder'}
                </button>
              </>
            ) : null}

            {step === 5 ? (
              <>
                <div className="eyebrow">6. Durum</div>
                <div className="support-grid">
                  <div className="support-card">
                    <div className="eyebrow">Commercial status</div>
                    <strong style={{ display: 'block', marginTop: 8 }}>{commercial.commercialStatus}</strong>
                    <p className="muted" style={{ marginBottom: 0 }}>
                      {commercial.pendingReview
                        ? 'Basvuru platform incelemesinde. Ek dogrulama gerekebilir.'
                        : commercial.canUseCommercialListingFeatures
                          ? 'Ticari yetkiler platform review ile acildi.'
                          : 'Durum ve sonraki adimlar asagida gosterilir.'}
                    </p>
                  </div>
                  <div className="support-card">
                    <div className="eyebrow">Sonraki adimlar</div>
                    <ul className="muted" style={{ margin: '10px 0 0', paddingLeft: 18 }}>
                      {commercial.nextActions.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="muted">
                  Onay, red, suspended veya revoked durumlari burada gorunur. Belge guncellemesi gerekirse yeniden yukleme yapabilirsin.
                </p>
              </>
            ) : null}

            {statusMessage ? <div style={{ color: 'var(--brand-strong)' }}>{statusMessage}</div> : null}
            {error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : null}

            <div className="post-actions">
              <button className="button button-secondary" type="button" onClick={() => setStep((current) => Math.max(current - 1, 0))} disabled={step === 0}>
                Geri
              </button>
              <button className="button button-primary" type="button" onClick={() => setStep((current) => Math.min(current + 1, STEP_TITLES.length - 1))} disabled={step === STEP_TITLES.length - 1}>
                Devam
              </button>
              <Link className="button button-ghost" href="/settings">
                Ayarlara don
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  );
}
