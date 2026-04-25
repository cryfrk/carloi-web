'use client';

import { useMemo, useState } from 'react';

import { webFeatureFlags } from '@/lib/feature-flags';
import { useSession } from '@/providers/session-provider';

type ListingStepKey =
  | 'vehicle_information'
  | 'pricing_description'
  | 'ownership_authorization'
  | 'compliance_responsibility'
  | 'billing_listing_fee'
  | 'preview_publish';

type SellerRelationType =
  | 'owner'
  | 'spouse'
  | 'relative_second_degree'
  | 'authorized_business'
  | 'other_authorized';

type ListingDraftState = {
  title: string;
  price: string;
  city: string;
  district: string;
  location: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  color: string;
  plateOrigin: string;
  plateNumber: string;
  damageRecord: string;
  paintInfo: string;
  changedParts: string;
  accidentInfo: string;
  description: string;
  extraEquipment: string;
  includeExpertiz: boolean;
  phone: string;
  sellerRelationType: SellerRelationType;
  registrationOwnerFullNameDeclared: string;
  isOwnerSameAsAccountHolder: boolean;
  authorizationDeclarationText: string;
  registrationOwnerName: string;
  registrationOwnerIdentityNumber: string;
  registrationSerialNumber: string;
  registrationDocumentNumber: string;
};

const emptyListingDraft: ListingDraftState = {
  title: '',
  price: '',
  city: '',
  district: '',
  location: '',
  transmission: '',
  fuelType: '',
  bodyType: '',
  color: '',
  plateOrigin: '',
  plateNumber: '',
  damageRecord: '',
  paintInfo: '',
  changedParts: '',
  accidentInfo: '',
  description: '',
  extraEquipment: '',
  includeExpertiz: true,
  phone: '',
  sellerRelationType: 'owner',
  registrationOwnerFullNameDeclared: '',
  isOwnerSameAsAccountHolder: true,
  authorizationDeclarationText: '',
  registrationOwnerName: '',
  registrationOwnerIdentityNumber: '',
  registrationSerialNumber: '',
  registrationDocumentNumber: '',
};

const steps: ReadonlyArray<{ key: ListingStepKey; title: string; summary: string }> = [
  {
    key: 'vehicle_information',
    title: 'Arac bilgileri',
    summary: 'Baslik, konum ve temel ilan alanlari.',
  },
  {
    key: 'pricing_description',
    title: 'Fiyat ve aciklama',
    summary: 'Vitrin metni, fiyat ve durum detaylari.',
  },
  {
    key: 'ownership_authorization',
    title: 'Sahiplik ve yetki',
    summary: 'Ruhsat sahibi ve temsil yetkisi bilgileri.',
  },
  {
    key: 'compliance_responsibility',
    title: 'Uyumluluk',
    summary: 'Sorumluluk ve guvenli odeme kabulleri.',
  },
  {
    key: 'billing_listing_fee',
    title: 'Ucretlendirme',
    summary: 'Abonelik ve listing ucreti kontrolu.',
  },
  {
    key: 'preview_publish',
    title: 'Onizleme',
    summary: 'Risk, moderation ve yayin karari.',
  },
];

const relationOptions: Array<{ key: SellerRelationType; label: string }> = [
  { key: 'owner', label: 'Arac sahibi' },
  { key: 'spouse', label: 'Es' },
  { key: 'relative_second_degree', label: '2. derece yakin' },
  { key: 'authorized_business', label: 'Yetkili isletme' },
  { key: 'other_authorized', label: 'Diger yetkili' },
];

function buildSteps() {
  return steps.filter((step) => step.key !== 'billing_listing_fee' || webFeatureFlags.enablePaidListings);
}

export function ComposerCard() {
  const { snapshot, runSnapshotAction, uploadMedia } = useSession();
  const [mode, setMode] = useState<'standard' | 'listing'>('standard');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [listingDraft, setListingDraft] = useState<ListingDraftState>(emptyListingDraft);
  const [listingResponsibilityAccepted, setListingResponsibilityAccepted] = useState(false);
  const [safePaymentAccepted, setSafePaymentAccepted] = useState(false);
  const [authorizationAccepted, setAuthorizationAccepted] = useState(false);
  const [billingStatus, setBillingStatus] = useState<'pending' | 'paid'>('pending');
  const [subscriptionTermsAccepted, setSubscriptionTermsAccepted] = useState(false);
  const [featuredRequested, setFeaturedRequested] = useState(false);
  const [activeStep, setActiveStep] = useState<ListingStepKey>('vehicle_information');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'success' | 'error'>('success');
  const [submitting, setSubmitting] = useState(false);

  const canCreateListing = Boolean(snapshot?.vehicle);
  const activeSteps = useMemo(() => buildSteps(), []);

  const selectedKinds = useMemo(
    () =>
      files.map((file) =>
        file.type.startsWith('video/')
          ? 'video'
          : file.type === 'image/gif'
            ? 'gif'
            : 'image',
      ),
    [files],
  );

  function setStatus(message: string | null, tone: 'success' | 'error' = 'success') {
    setStatusMessage(message);
    setStatusTone(tone);
  }

  function updateListingField<K extends keyof ListingDraftState>(key: K, value: ListingDraftState[K]) {
    setListingDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetComposer() {
    setContent('');
    setFiles([]);
    setListingDraft(emptyListingDraft);
    setListingResponsibilityAccepted(false);
    setSafePaymentAccepted(false);
    setAuthorizationAccepted(false);
    setBillingStatus('pending');
    setSubscriptionTermsAccepted(false);
    setFeaturedRequested(false);
    setMode('standard');
    setActiveStep('vehicle_information');
  }

  function getStepError(step: ListingStepKey) {
    switch (step) {
      case 'vehicle_information':
        if (!listingDraft.title.trim()) return 'Ilan basligi zorunludur.';
        if (!listingDraft.city.trim() || !listingDraft.district.trim()) {
          return 'Sehir ve ilce alanlarini tamamlayin.';
        }
        return '';
      case 'pricing_description':
        if (!listingDraft.price.trim()) return 'Fiyat zorunludur.';
        if (listingDraft.description.trim().length < 20) {
          return 'Aciklama en az 20 karakter olmali.';
        }
        return '';
      case 'ownership_authorization':
        if (!listingDraft.registrationOwnerFullNameDeclared.trim()) {
          return 'Ruhsat sahibi adini girin.';
        }
        if (
          listingDraft.sellerRelationType !== 'owner' &&
          !listingDraft.authorizationDeclarationText.trim()
        ) {
          return 'Yetki beyan metni zorunludur.';
        }
        return '';
      case 'compliance_responsibility':
        if (!listingResponsibilityAccepted) return 'Ilan sorumlulugu kabul edilmelidir.';
        if (!safePaymentAccepted) return 'Guvenli odeme bilgilendirmesi kabul edilmelidir.';
        if (listingDraft.sellerRelationType !== 'owner' && !authorizationAccepted) {
          return 'Yetki beyan onayini tamamlayin.';
        }
        return '';
      case 'billing_listing_fee':
        if (!subscriptionTermsAccepted) return 'Abonelik kosullarini onaylayin.';
        return '';
      default:
        return '';
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setStatus(null);

    try {
      const uploadedMedia = await Promise.all(
        files.map(async (file) => {
          const kind = file.type.startsWith('video/')
            ? 'video'
            : file.type === 'image/gif'
              ? 'gif'
              : 'image';
          const url = await uploadMedia(file, kind);
          return {
            kind,
            uri: url,
            label: file.name,
            hint: mode === 'listing' ? 'Ilan medyasi' : 'Gonderi medyasi',
            fileName: file.name,
            mimeType: file.type,
          };
        }),
      );

      const response = await runSnapshotAction('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          postType: mode,
          selectedMediaKinds: selectedKinds,
          selectedMedia: uploadedMedia,
          consents:
            mode === 'listing'
              ? [
                  {
                    type: 'listing_responsibility',
                    accepted: true,
                    version: '2026-04',
                    sourceScreen: 'listing_creation',
                  },
                  {
                    type: 'safe_payment_information',
                    accepted: true,
                    version: '2026-04',
                    sourceScreen: 'listing_creation',
                  },
                  ...(webFeatureFlags.enablePaidListings && subscriptionTermsAccepted
                    ? [
                        {
                          type: 'subscription_terms',
                          accepted: true,
                          version: '2026-04',
                          sourceScreen: 'listing_billing',
                        },
                      ]
                    : []),
                ]
              : undefined,
          listingFlow:
            mode === 'listing'
              ? {
                  vehicleInformation: {
                    title: listingDraft.title,
                    city: listingDraft.city,
                    district: listingDraft.district,
                    location: listingDraft.location,
                    phone: listingDraft.phone,
                    transmission: listingDraft.transmission,
                    fuelType: listingDraft.fuelType,
                    bodyType: listingDraft.bodyType,
                    color: listingDraft.color,
                    plateOrigin: listingDraft.plateOrigin,
                    plateNumber: listingDraft.plateNumber,
                    includeExpertiz: listingDraft.includeExpertiz,
                  },
                  pricingDescription: {
                    price: listingDraft.price,
                    description: listingDraft.description,
                    content,
                    damageRecord: listingDraft.damageRecord,
                    paintInfo: listingDraft.paintInfo,
                    changedParts: listingDraft.changedParts,
                    accidentInfo: listingDraft.accidentInfo,
                    extraEquipment: listingDraft.extraEquipment,
                  },
                  ownershipAuthorization: {
                    sellerRelationType: listingDraft.sellerRelationType,
                    registrationOwnerFullNameDeclared:
                      listingDraft.registrationOwnerFullNameDeclared,
                    isOwnerSameAsAccountHolder: listingDraft.isOwnerSameAsAccountHolder,
                    authorizationDeclarationText: listingDraft.authorizationDeclarationText,
                    registrationOwnerName: listingDraft.registrationOwnerName,
                    registrationOwnerIdentityNumber:
                      listingDraft.registrationOwnerIdentityNumber,
                    registrationSerialNumber: listingDraft.registrationSerialNumber,
                    registrationDocumentNumber: listingDraft.registrationDocumentNumber,
                  },
                  complianceResponsibility: {
                    listingResponsibilityAccepted,
                    authorizationDeclarationAccepted: authorizationAccepted,
                    safePaymentInformationAccepted: safePaymentAccepted,
                  },
                  billingListingFee: {
                    paymentStatus: webFeatureFlags.enablePaidListings ? billingStatus : 'not_required',
                    featuredRequested,
                  },
                  previewPublish: {
                    confirmed: true,
                    requestedAction: 'publish',
                  },
                }
              : undefined,
          listingDraft: mode === 'listing' ? listingDraft : undefined,
        }),
      });

      resetComposer();

      if (response.url && typeof window !== 'undefined') {
        window.location.assign(response.url);
        return;
      }

      setStatus(response.message || 'Icerik kaydedildi.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Islem tamamlanamadi.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const currentStepIndex = activeSteps.findIndex((step) => step.key === activeStep);
  const currentStep = activeSteps[currentStepIndex];

  return (
    <section className="glass-card composer-shell">
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow">Yeni icerik</div>
          <h2 style={{ margin: '10px 0 6px' }}>Feed ve listing akisini ayni yerden yonet</h2>
          <p className="muted" style={{ margin: 0 }}>
            Sosyal gonderi yayinlayabilir, listing akisini adim adim tamamlayabilir ve moderation
            kurallarini tek kartta gorebilirsin.
          </p>
        </div>
        <div className="post-actions">
          <button
            className={`button ${mode === 'standard' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => {
              setMode('standard');
              setStatus(null);
            }}
            type="button"
          >
            Gonderi
          </button>
          <button
            className={`button ${mode === 'listing' ? 'button-primary' : 'button-secondary'}`}
            disabled={!canCreateListing}
            onClick={() => {
              setMode('listing');
              setStatus(null);
            }}
            type="button"
          >
            Listing
          </button>
        </div>
      </div>

      {!canCreateListing && mode === 'listing' ? (
        <div className="status-banner error">
          Listing olusturmak icin once arac profilinizi tamamlamaniz gerekiyor.
        </div>
      ) : null}

      <label className="soft-card composer-dropzone">
        <strong>Gorsel veya video ekle</strong>
        <span className="muted">
          Medya secimi hem feed kartinda hem de listing detayinda daha guclu gorunurluk saglar.
        </span>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          onChange={(event) => setFiles(Array.from(event.target.files || []))}
        />
        <div className="post-actions">
          {files.length ? (
            files.map((file) => (
              <span key={`${file.name}-${file.size}`} className="tag">
                {file.name}
              </span>
            ))
          ) : (
            <span className="tag">Dosya secilmedi</span>
          )}
        </div>
      </label>

      {mode === 'standard' ? (
        <div className="stack">
          <textarea
            className="textarea"
            placeholder="Toplulukla ne paylasmak istiyorsunuz?"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <div className="post-actions" style={{ justifyContent: 'space-between' }}>
            <span className="muted">Kisa ve net paylasimlar feed performansini guclendirir.</span>
            <button className="button button-primary" disabled={submitting} onClick={handleSubmit} type="button">
              {submitting ? 'Gonderi yayinlaniyor...' : 'Gonderiyi yayinla'}
            </button>
          </div>
        </div>
      ) : (
        <div className="stack">
          <div className="auth-step-list">
            {activeSteps.map((step, index) => (
              <button
                key={step.key}
                className={`auth-step-chip ${step.key === activeStep ? 'active' : ''}`}
                onClick={() => setActiveStep(step.key)}
                type="button"
              >
                {index + 1}. {step.title}
              </button>
            ))}
          </div>

          <section className="soft-card" style={{ padding: 18, display: 'grid', gap: 14 }}>
            <div>
              <div className="eyebrow">Adim {currentStepIndex + 1}</div>
              <h3 style={{ margin: '8px 0 4px' }}>{currentStep?.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{currentStep?.summary}</p>
            </div>

            {activeStep === 'vehicle_information' ? (
              <div className="two-up">
                <input className="input" placeholder="Ilan basligi" value={listingDraft.title} onChange={(event) => updateListingField('title', event.target.value)} />
                <input className="input" placeholder="Telefon" value={listingDraft.phone} onChange={(event) => updateListingField('phone', event.target.value)} />
                <input className="input" placeholder="Sehir" value={listingDraft.city} onChange={(event) => updateListingField('city', event.target.value)} />
                <input className="input" placeholder="Ilce" value={listingDraft.district} onChange={(event) => updateListingField('district', event.target.value)} />
                <input className="input" placeholder="Konum satiri" value={listingDraft.location} onChange={(event) => updateListingField('location', event.target.value)} />
                <input className="input" placeholder="Plaka (opsiyonel)" value={listingDraft.plateNumber} onChange={(event) => updateListingField('plateNumber', event.target.value)} />
                <input className="input" placeholder="Yakit tipi" value={listingDraft.fuelType} onChange={(event) => updateListingField('fuelType', event.target.value)} />
                <input className="input" placeholder="Vites" value={listingDraft.transmission} onChange={(event) => updateListingField('transmission', event.target.value)} />
                <input className="input" placeholder="Kasa tipi" value={listingDraft.bodyType} onChange={(event) => updateListingField('bodyType', event.target.value)} />
                <input className="input" placeholder="Renk" value={listingDraft.color} onChange={(event) => updateListingField('color', event.target.value)} />
                <input className="input" placeholder="Plaka kokeni" value={listingDraft.plateOrigin} onChange={(event) => updateListingField('plateOrigin', event.target.value)} />
                <label className="support-card toggle-card">
                  <div>
                    <strong>Carloi ekspertiz ozeti</strong>
                    <div className="muted">Arac sagligi verisini listing kartina ekler.</div>
                  </div>
                  <input type="checkbox" checked={listingDraft.includeExpertiz} onChange={(event) => updateListingField('includeExpertiz', event.target.checked)} />
                </label>
              </div>
            ) : null}

            {activeStep === 'pricing_description' ? (
              <div className="stack">
                <input className="input" placeholder="Fiyat" value={listingDraft.price} onChange={(event) => updateListingField('price', event.target.value)} />
                <textarea className="textarea" placeholder="Feed ozet metni" value={content} onChange={(event) => setContent(event.target.value)} />
                <div className="two-up">
                  <input className="input" placeholder="Hasar kaydi" value={listingDraft.damageRecord} onChange={(event) => updateListingField('damageRecord', event.target.value)} />
                  <input className="input" placeholder="Boya durumu" value={listingDraft.paintInfo} onChange={(event) => updateListingField('paintInfo', event.target.value)} />
                  <input className="input" placeholder="Degisen parcalar" value={listingDraft.changedParts} onChange={(event) => updateListingField('changedParts', event.target.value)} />
                  <input className="input" placeholder="Kaza gecmisi" value={listingDraft.accidentInfo} onChange={(event) => updateListingField('accidentInfo', event.target.value)} />
                </div>
                <input className="input" placeholder="Ek donanim" value={listingDraft.extraEquipment} onChange={(event) => updateListingField('extraEquipment', event.target.value)} />
                <textarea className="textarea" placeholder="Detayli aciklama" value={listingDraft.description} onChange={(event) => updateListingField('description', event.target.value)} />
              </div>
            ) : null}

            {activeStep === 'ownership_authorization' ? (
              <div className="stack">
                <div className="post-actions" style={{ flexWrap: 'wrap' }}>
                  {relationOptions.map((option) => (
                    <button
                      key={option.key}
                      className={`button ${listingDraft.sellerRelationType === option.key ? 'button-primary' : 'button-secondary'}`}
                      onClick={() => updateListingField('sellerRelationType', option.key)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <input className="input" placeholder="Ruhsat sahibi ad soyad" value={listingDraft.registrationOwnerFullNameDeclared} onChange={(event) => updateListingField('registrationOwnerFullNameDeclared', event.target.value)} />
                <label className="support-card toggle-card">
                  <div>
                    <strong>Hesap sahibi ile ayni kisi</strong>
                    <div className="muted">Ruhsat sahibi ve hesap sahibi ayniysa ek yetki metni gerekmez.</div>
                  </div>
                  <input type="checkbox" checked={listingDraft.isOwnerSameAsAccountHolder} onChange={(event) => updateListingField('isOwnerSameAsAccountHolder', event.target.checked)} />
                </label>
                {listingDraft.sellerRelationType !== 'owner' ? (
                  <textarea className="textarea" placeholder="Yetki beyan metni" value={listingDraft.authorizationDeclarationText} onChange={(event) => updateListingField('authorizationDeclarationText', event.target.value)} />
                ) : null}
                <div className="two-up">
                  <input className="input" placeholder="Ruhsat sahibi" value={listingDraft.registrationOwnerName} onChange={(event) => updateListingField('registrationOwnerName', event.target.value)} />
                  <input className="input" placeholder="Kimlik numarasi" value={listingDraft.registrationOwnerIdentityNumber} onChange={(event) => updateListingField('registrationOwnerIdentityNumber', event.target.value)} />
                  <input className="input" placeholder="Seri numarasi" value={listingDraft.registrationSerialNumber} onChange={(event) => updateListingField('registrationSerialNumber', event.target.value)} />
                  <input className="input" placeholder="Belge numarasi" value={listingDraft.registrationDocumentNumber} onChange={(event) => updateListingField('registrationDocumentNumber', event.target.value)} />
                </div>
              </div>
            ) : null}

            {activeStep === 'compliance_responsibility' ? (
              <div className="stack">
                <label className="support-card toggle-card">
                  <div>
                    <strong>Ilan sorumlulugu</strong>
                    <div className="muted">Fiyat, arac bilgisi ve temsil yetkisi kullanici beyanidir.</div>
                  </div>
                  <input type="checkbox" checked={listingResponsibilityAccepted} onChange={(event) => setListingResponsibilityAccepted(event.target.checked)} />
                </label>
                {listingDraft.sellerRelationType !== 'owner' ? (
                  <label className="support-card toggle-card">
                    <div>
                      <strong>Yetki onayi</strong>
                      <div className="muted">Yetki belgesinin ve beyanin gecerli oldugunu onaylar.</div>
                    </div>
                    <input type="checkbox" checked={authorizationAccepted} onChange={(event) => setAuthorizationAccepted(event.target.checked)} />
                  </label>
                ) : null}
                <label className="support-card toggle-card">
                  <div>
                    <strong>Guvenli odeme bilgilendirmesi</strong>
                    <div className="muted">Platformun resmi odeme saglayicisi olmadigi bilgisi kayit altina alinir.</div>
                  </div>
                  <input type="checkbox" checked={safePaymentAccepted} onChange={(event) => setSafePaymentAccepted(event.target.checked)} />
                </label>
              </div>
            ) : null}

            {activeStep === 'billing_listing_fee' ? (
              <div className="stack">
                <div className="support-grid">
                  <button
                    className={`choice-card ${billingStatus === 'pending' ? 'active-card' : ''}`}
                    onClick={() => {
                      setBillingStatus('pending');
                      setFeaturedRequested(false);
                    }}
                    type="button"
                  >
                    <div className="eyebrow">Standart</div>
                    <strong>Normal listing</strong>
                    <p className="muted" style={{ marginBottom: 0 }}>
                      Gerekiyorsa backend standart listing ucretini veya abonelik durumunu kontrol eder.
                    </p>
                  </button>
                  <button
                    className={`choice-card ${billingStatus === 'paid' ? 'active-card' : ''}`}
                    onClick={() => {
                      setBillingStatus('paid');
                      setFeaturedRequested(true);
                    }}
                    type="button"
                  >
                    <div className="eyebrow">Featured</div>
                    <strong>Vitrin talebi</strong>
                    <p className="muted" style={{ marginBottom: 0 }}>
                      Odenecekse checkout acilir, onay beklenirse listing incelemeye duser.
                    </p>
                  </button>
                </div>
                <label className="support-card toggle-card">
                  <div>
                    <strong>Abonelik ve dijital hizmet kosullari</strong>
                    <div className="muted">Ucretli alanlar aciksa billing onayi olmadan yayin acilmaz.</div>
                  </div>
                  <input type="checkbox" checked={subscriptionTermsAccepted} onChange={(event) => setSubscriptionTermsAccepted(event.target.checked)} />
                </label>
              </div>
            ) : null}

            {activeStep === 'preview_publish' ? (
              <div className="stack">
                <div className="listing-inline-card">
                  <div className="listing-inline-header">
                    <div className="stack" style={{ gap: 4 }}>
                      <div className="eyebrow">Listing onizleme</div>
                      <h3>{listingDraft.title || 'Baslik bekleniyor'}</h3>
                      <div className="listing-inline-price">{listingDraft.price || 'Fiyat bekleniyor'}</div>
                    </div>
                    <div className="listing-inline-badges">
                      <span className="tag">{listingDraft.city || 'Sehir'}</span>
                      <span className="tag">{featuredRequested ? 'Featured talebi' : 'Standart yayin'}</span>
                    </div>
                  </div>
                  <div className="listing-inline-grid">
                    <div className="metric-card">
                      <div className="muted">Konum</div>
                      <strong>{listingDraft.location || 'Konum bekleniyor'}</strong>
                    </div>
                    <div className="metric-card">
                      <div className="muted">Yakit / vites</div>
                      <strong>
                        {[listingDraft.fuelType, listingDraft.transmission].filter(Boolean).join(' / ') || '-'}
                      </strong>
                    </div>
                    <div className="metric-card">
                      <div className="muted">Yetki tipi</div>
                      <strong>
                        {relationOptions.find((item) => item.key === listingDraft.sellerRelationType)?.label || 'Belirtilmedi'}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="support-card">
                  <strong>Yayin karari nasil verilir?</strong>
                  <p className="muted" style={{ marginBottom: 0 }}>
                    Dusuk riskli listingler yayina alinabilir. Orta riskli listingler incelemeye dusebilir.
                    Yuksek riskte ek belge veya odeme dogrulamasi istenebilir.
                  </p>
                </div>
              </div>
            ) : null}

            {getStepError(activeStep) ? (
              <div className="status-banner error">{getStepError(activeStep)}</div>
            ) : null}
          </section>

          <div className="post-actions" style={{ justifyContent: 'space-between' }}>
            <span className="muted">
              Listing akisi, beyan, billing ve moderation kontrolleriyle birlikte calisir.
            </span>
            <div className="post-actions">
              {currentStepIndex > 0 ? (
                <button
                  className="button button-secondary"
                  onClick={() => setActiveStep(activeSteps[currentStepIndex - 1].key)}
                  type="button"
                >
                  Geri
                </button>
              ) : null}
              {currentStepIndex < activeSteps.length - 1 ? (
                <button
                  className="button button-primary"
                  onClick={() => {
                    const error = getStepError(activeStep);
                    if (error) {
                      setStatus(error, 'error');
                      return;
                    }
                    setStatus(null);
                    setActiveStep(activeSteps[currentStepIndex + 1].key);
                  }}
                  type="button"
                >
                  Devam
                </button>
              ) : (
                <button
                  className="button button-primary"
                  disabled={submitting || !canCreateListing}
                  onClick={handleSubmit}
                  type="button"
                >
                  {submitting ? 'Listing isleniyor...' : 'Listingi yayina gonder'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {statusMessage ? (
        <div className={`status-banner ${statusTone === 'error' ? 'error' : 'success'}`}>
          {statusMessage}
        </div>
      ) : null}
    </section>
  );
}
