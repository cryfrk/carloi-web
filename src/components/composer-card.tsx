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

const emptyListingDraft = {
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

const steps = [
  { key: 'vehicle_information', title: 'Araç Bilgileri' },
  { key: 'pricing_description', title: 'Fiyat ve Açıklama' },
  { key: 'ownership_authorization', title: 'Sahiplik / Yetki' },
  { key: 'compliance_responsibility', title: 'Uyumluluk' },
  { key: 'billing_listing_fee', title: 'Ücretlendirme' },
  { key: 'preview_publish', title: 'Önizleme' },
] as const satisfies ReadonlyArray<{ key: ListingStepKey; title: string }>;

const relationOptions = [
  { key: 'owner', label: 'Araç sahibi' },
  { key: 'spouse', label: 'Eş' },
  { key: 'relative_second_degree', label: '2. derece yakını' },
  { key: 'authorized_business', label: 'Yetkili işletme' },
  { key: 'other_authorized', label: 'Diğer yetkili' },
];

function buildSteps() {
  return steps.filter((step) => step.key !== 'billing_listing_fee' || webFeatureFlags.enablePaidListings);
}

export function ComposerCard() {
  const { snapshot, runSnapshotAction, uploadMedia } = useSession();
  const [mode, setMode] = useState<'standard' | 'listing'>('standard');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [listingDraft, setListingDraft] = useState(emptyListingDraft);
  const [listingResponsibilityAccepted, setListingResponsibilityAccepted] = useState(false);
  const [safePaymentAccepted, setSafePaymentAccepted] = useState(false);
  const [authorizationAccepted, setAuthorizationAccepted] = useState(false);
  const [billingStatus, setBillingStatus] = useState<'pending' | 'paid'>('pending');
  const [subscriptionTermsAccepted, setSubscriptionTermsAccepted] = useState(false);
  const [featuredRequested, setFeaturedRequested] = useState(false);
  const [activeStep, setActiveStep] = useState<ListingStepKey>('vehicle_information');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
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

  function updateListingField(key: keyof typeof emptyListingDraft, value: string | boolean) {
    setListingDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function getStepError(step: ListingStepKey) {
    switch (step) {
      case 'vehicle_information':
        if (!listingDraft.title.trim()) return 'İlan başlığı zorunludur.';
        if (!listingDraft.city.trim() || !listingDraft.district.trim()) return 'Şehir ve ilçe zorunludur.';
        return '';
      case 'pricing_description':
        if (!listingDraft.price.trim()) return 'Fiyat zorunludur.';
        if (listingDraft.description.trim().length < 20) return 'Açıklama en az 20 karakter olmalıdır.';
        return '';
      case 'ownership_authorization':
        if (!listingDraft.registrationOwnerFullNameDeclared.trim()) return 'Ruhsat sahibi adı zorunludur.';
        if (listingDraft.sellerRelationType !== 'owner' && !listingDraft.authorizationDeclarationText.trim()) {
          return 'Yetki beyanı zorunludur.';
        }
        return '';
      case 'compliance_responsibility':
        if (!listingResponsibilityAccepted) return 'İlan sorumluluğu onayı gereklidir.';
        if (!safePaymentAccepted) return 'Güvenli ödeme bilgilendirmesi onayı gereklidir.';
        if (listingDraft.sellerRelationType !== 'owner' && !authorizationAccepted) {
          return 'Yetki beyanını onaylayın.';
        }
        return '';
      case 'billing_listing_fee':
        if (!subscriptionTermsAccepted) return 'Abonelik ve dijital hizmet koşulları onayı gereklidir.';
        return '';
      default:
        return '';
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setStatusMessage(null);
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
            hint: mode === 'listing' ? 'İlan medyası' : 'Gönderi medyası',
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
                  { type: 'listing_responsibility', accepted: true, version: '2026-04', sourceScreen: 'listing_creation' },
                  { type: 'safe_payment_information', accepted: true, version: '2026-04', sourceScreen: 'listing_creation' },
                  ...(webFeatureFlags.enablePaidListings && subscriptionTermsAccepted
                    ? [{ type: 'subscription_terms', accepted: true, version: '2026-04', sourceScreen: 'listing_billing' }]
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
                    registrationOwnerFullNameDeclared: listingDraft.registrationOwnerFullNameDeclared,
                    isOwnerSameAsAccountHolder: listingDraft.isOwnerSameAsAccountHolder,
                    authorizationDeclarationText: listingDraft.authorizationDeclarationText,
                    registrationOwnerName: listingDraft.registrationOwnerName,
                    registrationOwnerIdentityNumber: listingDraft.registrationOwnerIdentityNumber,
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
      if (response.url && typeof window !== 'undefined') {
        window.location.assign(response.url);
        return;
      }
      setStatusMessage(response.message || 'İşlem tamamlandı.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'İşlem tamamlanamadı.');
    } finally {
      setSubmitting(false);
    }
  }

  const currentStepIndex = activeSteps.findIndex((step) => step.key === activeStep);
  const currentStep = activeSteps[currentStepIndex];

  return (
    <section className="glass-card" style={{ padding: 22, display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div>
          <div className="eyebrow">Yeni paylaşım</div>
          <h2 style={{ margin: '8px 0 0' }}>Carloi akışına içerik ekle</h2>
        </div>
        <div className="post-actions">
          <button className={`button ${mode === 'standard' ? 'button-primary' : 'button-secondary'}`} onClick={() => setMode('standard')}>
            Gönderi
          </button>
          <button
            className={`button ${mode === 'listing' ? 'button-primary' : 'button-secondary'}`}
            disabled={!canCreateListing}
            onClick={() => setMode('listing')}
          >
            İlan v2
          </button>
        </div>
      </div>

      <label className="soft-card" style={{ padding: 16, display: 'grid', gap: 10, cursor: 'pointer' }}>
        <strong>Fotoğraf / video ekle</strong>
        <span className="muted">Medya alanı ilan kartında öne çıkarılır.</span>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          onChange={(event) => setFiles(Array.from(event.target.files || []))}
        />
        {files.length ? (
          <div className="post-actions">
            {files.map((file) => (
              <span key={file.name} className="tag">
                {file.name}
              </span>
            ))}
          </div>
        ) : null}
      </label>

      {mode === 'standard' ? (
        <textarea
          className="textarea"
          placeholder="Toplulukla ne paylaşmak istiyorsunuz?"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      ) : (
        <>
          <div className="post-actions" style={{ flexWrap: 'wrap' }}>
            {activeSteps.map((step, index) => (
              <button
                key={step.key}
                className={`button ${step.key === activeStep ? 'button-primary' : 'button-secondary'}`}
                onClick={() => setActiveStep(step.key)}
                type="button"
              >
                {index + 1}. {step.title}
              </button>
            ))}
          </div>

          <section className="soft-card" style={{ padding: 18, display: 'grid', gap: 14 }}>
            <div>
              <div className="eyebrow">Adım {currentStepIndex + 1}</div>
              <h3 style={{ margin: '8px 0 0' }}>{currentStep?.title}</h3>
            </div>

            {activeStep === 'vehicle_information' ? (
              <div className="two-up">
                <input className="input" placeholder="İlan başlığı" value={listingDraft.title} onChange={(event) => updateListingField('title', event.target.value)} />
                <input className="input" placeholder="Telefon" value={listingDraft.phone} onChange={(event) => updateListingField('phone', event.target.value)} />
                <input className="input" placeholder="Şehir" value={listingDraft.city} onChange={(event) => updateListingField('city', event.target.value)} />
                <input className="input" placeholder="İlçe" value={listingDraft.district} onChange={(event) => updateListingField('district', event.target.value)} />
                <input className="input" placeholder="Konum satırı" value={listingDraft.location} onChange={(event) => updateListingField('location', event.target.value)} />
                <input className="input" placeholder="Plaka (opsiyonel)" value={listingDraft.plateNumber} onChange={(event) => updateListingField('plateNumber', event.target.value)} />
                <input className="input" placeholder="Yakıt" value={listingDraft.fuelType} onChange={(event) => updateListingField('fuelType', event.target.value)} />
                <input className="input" placeholder="Vites" value={listingDraft.transmission} onChange={(event) => updateListingField('transmission', event.target.value)} />
                <input className="input" placeholder="Kasa tipi" value={listingDraft.bodyType} onChange={(event) => updateListingField('bodyType', event.target.value)} />
                <input className="input" placeholder="Renk" value={listingDraft.color} onChange={(event) => updateListingField('color', event.target.value)} />
                <input className="input" placeholder="Plaka kökeni" value={listingDraft.plateOrigin} onChange={(event) => updateListingField('plateOrigin', event.target.value)} />
                <label className="tag" style={{ justifyContent: 'space-between' }}>
                  <span>Carloi ekspertiz özetini ekle</span>
                  <input type="checkbox" checked={listingDraft.includeExpertiz} onChange={(event) => updateListingField('includeExpertiz', event.target.checked)} />
                </label>
              </div>
            ) : null}

            {activeStep === 'pricing_description' ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <input className="input" placeholder="Fiyat" value={listingDraft.price} onChange={(event) => updateListingField('price', event.target.value)} />
                <textarea className="textarea" placeholder="Vitrin özeti" value={content} onChange={(event) => setContent(event.target.value)} />
                <div className="two-up">
                  <input className="input" placeholder="Hasar kaydı" value={listingDraft.damageRecord} onChange={(event) => updateListingField('damageRecord', event.target.value)} />
                  <input className="input" placeholder="Boya" value={listingDraft.paintInfo} onChange={(event) => updateListingField('paintInfo', event.target.value)} />
                  <input className="input" placeholder="Değişen" value={listingDraft.changedParts} onChange={(event) => updateListingField('changedParts', event.target.value)} />
                  <input className="input" placeholder="Kaza geçmişi" value={listingDraft.accidentInfo} onChange={(event) => updateListingField('accidentInfo', event.target.value)} />
                </div>
                <input className="input" placeholder="Ek donanım" value={listingDraft.extraEquipment} onChange={(event) => updateListingField('extraEquipment', event.target.value)} />
                <textarea className="textarea" placeholder="Detaylı açıklama" value={listingDraft.description} onChange={(event) => updateListingField('description', event.target.value)} />
              </div>
            ) : null}

            {activeStep === 'ownership_authorization' ? (
              <div style={{ display: 'grid', gap: 12 }}>
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
                <input className="input" placeholder="Ruhsat sahibi adı soyadı" value={listingDraft.registrationOwnerFullNameDeclared} onChange={(event) => updateListingField('registrationOwnerFullNameDeclared', event.target.value)} />
                <label className="tag" style={{ justifyContent: 'space-between' }}>
                  <span>Ruhsat sahibi hesap sahibi ile aynı</span>
                  <input type="checkbox" checked={listingDraft.isOwnerSameAsAccountHolder} onChange={(event) => updateListingField('isOwnerSameAsAccountHolder', event.target.checked)} />
                </label>
                {listingDraft.sellerRelationType !== 'owner' ? (
                  <textarea className="textarea" placeholder="Yetki beyan metni" value={listingDraft.authorizationDeclarationText} onChange={(event) => updateListingField('authorizationDeclarationText', event.target.value)} />
                ) : null}
                <div className="two-up">
                  <input className="input" placeholder="Ruhsat sahibi" value={listingDraft.registrationOwnerName} onChange={(event) => updateListingField('registrationOwnerName', event.target.value)} />
                  <input className="input" placeholder="Kimlik numarası" value={listingDraft.registrationOwnerIdentityNumber} onChange={(event) => updateListingField('registrationOwnerIdentityNumber', event.target.value)} />
                  <input className="input" placeholder="Seri no" value={listingDraft.registrationSerialNumber} onChange={(event) => updateListingField('registrationSerialNumber', event.target.value)} />
                  <input className="input" placeholder="Belge no" value={listingDraft.registrationDocumentNumber} onChange={(event) => updateListingField('registrationDocumentNumber', event.target.value)} />
                </div>
              </div>
            ) : null}

            {activeStep === 'compliance_responsibility' ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <label className="tag" style={{ justifyContent: 'space-between' }}>
                  <span>İlan sorumluluğunu kabul ediyorum</span>
                  <input type="checkbox" checked={listingResponsibilityAccepted} onChange={(event) => setListingResponsibilityAccepted(event.target.checked)} />
                </label>
                {listingDraft.sellerRelationType !== 'owner' ? (
                  <label className="tag" style={{ justifyContent: 'space-between' }}>
                    <span>Yetki beyanını onaylıyorum</span>
                    <input type="checkbox" checked={authorizationAccepted} onChange={(event) => setAuthorizationAccepted(event.target.checked)} />
                  </label>
                ) : null}
                <label className="tag" style={{ justifyContent: 'space-between' }}>
                  <span>Güvenli ödeme bilgilendirmesini kabul ediyorum</span>
                  <input type="checkbox" checked={safePaymentAccepted} onChange={(event) => setSafePaymentAccepted(event.target.checked)} />
                </label>
                <p className="muted">Araç ve yetki bilgileri kullanıcı tarafından beyan edilir. Gerekirse ek doğrulama istenebilir.</p>
              </div>
            ) : null}

            {activeStep === 'billing_listing_fee' ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <p className="muted">Ucretli ilan aciksa odeme veya aktif abonelik backend tarafinda dogrulanmadan yayin acilmaz.</p>
                <div className="post-actions">
                  <button
                    className={`button ${billingStatus === 'pending' ? 'button-primary' : 'button-secondary'}`}
                    onClick={() => {
                      setBillingStatus('pending');
                      setFeaturedRequested(false);
                      setSubscriptionTermsAccepted(true);
                    }}
                    type="button"
                  >
                    Standart yayin
                  </button>
                  <button
                    className={`button ${billingStatus === 'paid' ? 'button-primary' : 'button-secondary'}`}
                    onClick={() => {
                      setBillingStatus('paid');
                      setFeaturedRequested(true);
                      setSubscriptionTermsAccepted(true);
                    }}
                    type="button"
                  >
                    Featured talebi
                  </button>
                </div>
                <label className="tag" style={{ justifyContent: 'space-between' }}>
                  <span>Abonelik ve dijital hizmet kosullarini kabul ediyorum</span>
                  <input
                    type="checkbox"
                    checked={subscriptionTermsAccepted}
                    onChange={(event) => setSubscriptionTermsAccepted(event.target.checked)}
                  />
                </label>
              </div>
            ) : null}

            {activeStep === 'preview_publish' ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <div className="soft-card" style={{ padding: 16 }}>
                  <strong>{listingDraft.title || 'Başlıksız ilan'}</strong>
                  <p className="muted" style={{ margin: '8px 0 0' }}>
                    {listingDraft.price || 'Fiyat yok'} • {listingDraft.city || 'Şehir yok'} / {listingDraft.district || 'İlçe yok'}
                  </p>
                </div>
                {webFeatureFlags.enablePaidListings ? (
                  <div className="soft-card" style={{ padding: 16 }}>
                    <strong>Billing check</strong>
                    <p className="muted" style={{ margin: '8px 0 0' }}>
                      {featuredRequested
                        ? 'Featured listing ucreti gerekirse checkout adimi acilir.'
                        : 'Standart listing ucreti veya abonelik backend tarafinda kontrol edilir.'}
                    </p>
                  </div>
                ) : null}
                <p className="muted">Düşük riskte ilan yayına alınır. Orta riskte incelemeye düşer. Yüksek riskte ek doğrulama gerekebilir.</p>
              </div>
            ) : null}

            {mode === 'listing' && getStepError(activeStep) ? (
              <p style={{ color: '#c2410c', margin: 0 }}>{getStepError(activeStep)}</p>
            ) : null}
          </section>
        </>
      )}

      {statusMessage ? <p style={{ color: '#0f766e', margin: 0 }}>{statusMessage}</p> : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span className="muted">
          {mode === 'listing'
            ? canCreateListing
              ? 'Listing Create Flow v2 güvenli beyan ve risk kontrollü yayın mantığıyla çalışır.'
              : 'İlan oluşturmak için önce araç profilinizi ekleyin.'
            : 'Gönderiler aynı sosyal akış mantığıyla yayınlanır.'}
        </span>
        <div className="post-actions">
          {mode === 'listing' && currentStepIndex > 0 ? (
            <button className="button button-secondary" onClick={() => setActiveStep(activeSteps[currentStepIndex - 1].key)} type="button">
              Geri
            </button>
          ) : null}
          {mode === 'listing' && currentStepIndex < activeSteps.length - 1 ? (
            <button
              className="button button-primary"
              onClick={() => {
                const error = getStepError(activeStep);
                if (error) {
                  setStatusMessage(error);
                  return;
                }
                setActiveStep(activeSteps[currentStepIndex + 1].key);
              }}
              type="button"
            >
              İleri
            </button>
          ) : (
            <button className="button button-primary" disabled={submitting || (mode === 'listing' && !canCreateListing)} onClick={handleSubmit}>
              {submitting ? 'Kaydediliyor...' : mode === 'listing' ? 'Yayın kararını uygula' : 'Gönderiyi yayınla'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
