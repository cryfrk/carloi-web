'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { requestAdminProxy, requestProxy } from '@/lib/client-api';

interface AdminInsuranceDeal {
  conversationId: string;
  postId: string;
  status: string;
  quoteAmount: string;
  paymentReference: string;
  registrationSharedAt?: string | null;
  paymentRequestedAt?: string | null;
  paymentPaidAt?: string | null;
  policyUri?: string | null;
  invoiceUri?: string | null;
  policySentAt?: string | null;
  buyerAgreed: boolean;
  sellerAgreed: boolean;
  listing?: {
    title?: string;
    price?: string;
    location?: string;
    isSold?: boolean;
  };
  buyer?: {
    id: string;
    name: string;
    handle: string;
    email?: string;
    phone?: string;
  };
  seller?: {
    id: string;
    name: string;
    handle: string;
    email?: string;
    phone?: string;
  };
  registrationInfo?: Record<string, string>;
}

interface DeliveryDraft {
  policyFile?: File | null;
  invoiceFile?: File | null;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return 'Bekleniyor';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function classifyDealStatus(deal: AdminInsuranceDeal) {
  if (deal.status === 'policy_sent') {
    return 'Teslim edildi';
  }

  if (deal.status === 'processing' || deal.status === 'paid') {
    return 'Police hazirlaniyor';
  }

  if (deal.status === 'payment_pending') {
    return 'Odeme bekleniyor';
  }

  if (deal.status === 'quoted') {
    return 'Odeme adimi acik';
  }

  if (deal.status === 'awaiting_quote') {
    return 'Teklif bekleniyor';
  }

  return 'Ruhsat bekleniyor';
}

export default function AdminInsurancePage() {
  const [deals, setDeals] = useState<AdminInsuranceDeal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteInputs, setQuoteInputs] = useState<Record<string, string>>({});
  const [quoteBusyId, setQuoteBusyId] = useState<string | null>(null);
  const [deliveryBusyId, setDeliveryBusyId] = useState<string | null>(null);
  const [deliveryDrafts, setDeliveryDrafts] = useState<Record<string, DeliveryDraft>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const loadDeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await requestAdminProxy<{ success: true; deals: AdminInsuranceDeal[] }>('/deals');
      setDeals(response.deals || []);
      setQuoteInputs((current) => {
        const next = { ...current };
        for (const deal of response.deals || []) {
          if (!next[deal.conversationId] && deal.quoteAmount) {
            next[deal.conversationId] = deal.quoteAmount;
          }
        }
        return next;
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sigorta operasyon kayitlari yuklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDeals();
  }, [loadDeals]);

  const metrics = useMemo(() => {
    const delivered = deals.filter((deal) => deal.status === 'policy_sent').length;
    const quotePending = deals.filter((deal) => deal.status === 'awaiting_quote').length;
    const paymentPending = deals.filter((deal) =>
      ['quoted', 'payment_pending', 'paid', 'processing'].includes(deal.status),
    ).length;
    const readyForDelivery = deals.filter((deal) =>
      ['paid', 'processing'].includes(deal.status),
    ).length;

    return [
      {
        label: 'Toplam talep',
        value: String(deals.length),
        helper: 'Ruhsat paylasimi ile olusan tum sigorta is akislari.',
      },
      {
        label: 'Teklif bekleyen',
        value: String(quotePending),
        helper: 'Admin fiyat girmesi gereken kayitlar.',
      },
      {
        label: 'Odeme / police asamasi',
        value: String(paymentPending),
        helper: 'Odeme bekleyen veya odeme sonrasi police hazirligi surren kayitlar.',
      },
      {
        label: 'Teslim edilen',
        value: String(delivered),
        helper: `${readyForDelivery} kayit police ve fatura yuklemesi icin uygun durumda.`,
      },
    ];
  }, [deals]);

  const pendingDeals = useMemo(
    () => deals.filter((deal) => deal.status !== 'policy_sent'),
    [deals],
  );
  const deliveredDeals = useMemo(
    () => deals.filter((deal) => deal.status === 'policy_sent'),
    [deals],
  );

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await requestProxy<{ success: true; url: string }>('/api/media/upload', {
      method: 'POST',
      body: formData,
    });
    return response.url;
  }, []);

  const submitQuote = useCallback(
    async (deal: AdminInsuranceDeal) => {
      const amount = String(quoteInputs[deal.conversationId] || '').trim();
      if (!amount) {
        setError('Sigorta teklif tutari zorunludur.');
        return;
      }

      setError(null);
      setNotice(null);
      setQuoteBusyId(deal.conversationId);
      try {
        await requestAdminProxy(`/deals/${deal.conversationId}/quote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        });
        setNotice('Sigorta teklif tutari kaydedildi.');
        await loadDeals();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Sigorta teklifi kaydedilemedi.');
      } finally {
        setQuoteBusyId(null);
      }
    },
    [loadDeals, quoteInputs],
  );

  const submitDelivery = useCallback(
    async (deal: AdminInsuranceDeal) => {
      const draft = deliveryDrafts[deal.conversationId] || {};
      if (!draft.policyFile && !deal.policyUri) {
        setError('Police PDF secilmelidir.');
        return;
      }
      if (!draft.invoiceFile && !deal.invoiceUri) {
        setError('Fatura PDF secilmelidir.');
        return;
      }

      setError(null);
      setNotice(null);
      setDeliveryBusyId(deal.conversationId);

      try {
        const policyUrl = draft.policyFile ? await uploadFile(draft.policyFile) : String(deal.policyUri || '');
        const invoiceUrl = draft.invoiceFile ? await uploadFile(draft.invoiceFile) : String(deal.invoiceUri || '');

        await requestAdminProxy(`/deals/${deal.conversationId}/policy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ policyUrl, invoiceUrl }),
        });

        setDeliveryDrafts((current) => ({
          ...current,
          [deal.conversationId]: {
            policyFile: null,
            invoiceFile: null,
          },
        }));
        setNotice('Police ve fatura aliciya gonderildi.');
        await loadDeals();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Police teslimi tamamlanamadi.');
      } finally {
        setDeliveryBusyId(null);
      }
    },
    [deliveryDrafts, loadDeals, uploadFile],
  );

  const renderRegistrationInfo = (deal: AdminInsuranceDeal) => {
    const entries = Object.entries(deal.registrationInfo || {}).filter(([, value]) => Boolean(value));

    if (!entries.length) {
      return <p className="muted">Ruhsat ayrintisi henuz sistemde gorunur degil.</p>;
    }

    return (
      <div style={{ display: 'grid', gap: 10 }}>
        {entries.map(([key, value]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              padding: '10px 12px',
              borderRadius: 14,
              background: 'rgba(148,163,184,0.08)',
            }}
          >
            <strong style={{ textTransform: 'capitalize' }}>{key}</strong>
            <span className="muted">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderDealCard = (deal: AdminInsuranceDeal) => {
    const isQuoteBusy = quoteBusyId === deal.conversationId;
    const isDeliveryBusy = deliveryBusyId === deal.conversationId;
    const currentDraft = deliveryDrafts[deal.conversationId] || {};
    const canDeliver = ['paid', 'processing', 'policy_sent'].includes(deal.status);

    return (
      <article
        key={deal.conversationId}
        className="soft-card admin-panel-card"
        style={{ display: 'grid', gap: 18 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>
              {deal.listing?.title || 'Listing sigorta sureci'}
            </h3>
            <div className="muted">
              {deal.listing?.price || 'Tutar yok'} • {deal.listing?.location || 'Konum yok'}
            </div>
            <div className="muted" style={{ marginTop: 6 }}>
              Durum: {classifyDealStatus(deal)}
            </div>
          </div>
          <div className="support-card" style={{ minWidth: 220 }}>
            <strong>Odeme akisi</strong>
            <div className="muted" style={{ marginTop: 8 }}>
              Referans: {deal.paymentReference || 'Henuz olusmadi'}
            </div>
            <div className="muted">Teklif: {deal.quoteAmount || 'Bekleniyor'}</div>
            <div className="muted">Odeme istendi: {formatDateTime(deal.paymentRequestedAt)}</div>
            <div className="muted">Odeme alindi: {formatDateTime(deal.paymentPaidAt)}</div>
            <div className="muted">Police gonderimi: {formatDateTime(deal.policySentAt)}</div>
          </div>
        </div>

        <section className="admin-panel-grid">
          <article className="support-card">
            <strong>Alici</strong>
            <div className="muted" style={{ marginTop: 8 }}>
              {deal.buyer?.name || 'Bilinmiyor'} {deal.buyer?.handle || ''}
            </div>
            <div className="muted">{deal.buyer?.email || 'E-posta yok'}</div>
            <div className="muted">{deal.buyer?.phone || 'Telefon yok'}</div>
          </article>

          <article className="support-card">
            <strong>Satici</strong>
            <div className="muted" style={{ marginTop: 8 }}>
              {deal.seller?.name || 'Bilinmiyor'} {deal.seller?.handle || ''}
            </div>
            <div className="muted">{deal.seller?.email || 'E-posta yok'}</div>
            <div className="muted">{deal.seller?.phone || 'Telefon yok'}</div>
          </article>
        </section>

        <section className="support-card">
          <strong>Ruhsat bilgisi</strong>
          <div className="muted" style={{ marginTop: 6, marginBottom: 12 }}>
            Ruhsat paylasim zamani: {formatDateTime(deal.registrationSharedAt)}
          </div>
          {renderRegistrationInfo(deal)}
        </section>

        <section className="admin-panel-grid">
          <article className="support-card">
            <strong>Sigorta teklif girisi</strong>
            <div className="muted" style={{ marginTop: 8 }}>
              Teklif verilmeden alici odeme adimina gecemez.
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <input
                value={quoteInputs[deal.conversationId] ?? deal.quoteAmount ?? ''}
                onChange={(event) =>
                  setQuoteInputs((current) => ({
                    ...current,
                    [deal.conversationId]: event.target.value,
                  }))
                }
                placeholder="Orn. 4850 TRY"
                style={{
                  minHeight: 42,
                  flex: '1 1 220px',
                  borderRadius: 999,
                  border: '1px solid rgba(148,163,184,0.25)',
                  padding: '0 16px',
                  background: '#fff',
                }}
              />
              <button
                type="button"
                className="button"
                disabled={isQuoteBusy}
                onClick={() => void submitQuote(deal)}
              >
                {isQuoteBusy ? 'Kaydediliyor...' : 'Teklifi kaydet'}
              </button>
            </div>
          </article>

          <article className="support-card">
            <strong>Police ve fatura teslimi</strong>
            <div className="muted" style={{ marginTop: 8 }}>
              Odeme backend callback ile dogrulanmadan police gonderilmemelidir.
            </div>
            <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span className="muted">Police PDF</span>
                <input
                  accept="application/pdf"
                  type="file"
                  onChange={(event) =>
                    setDeliveryDrafts((current) => ({
                      ...current,
                      [deal.conversationId]: {
                        ...current[deal.conversationId],
                        policyFile: event.target.files?.[0] || null,
                      },
                    }))
                  }
                />
                {deal.policyUri ? (
                  <a href={deal.policyUri} target="_blank" rel="noreferrer" className="muted">
                    Mevcut policeyi ac
                  </a>
                ) : null}
                {currentDraft.policyFile ? (
                  <span className="muted">Hazir dosya: {currentDraft.policyFile.name}</span>
                ) : null}
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span className="muted">Fatura PDF</span>
                <input
                  accept="application/pdf"
                  type="file"
                  onChange={(event) =>
                    setDeliveryDrafts((current) => ({
                      ...current,
                      [deal.conversationId]: {
                        ...current[deal.conversationId],
                        invoiceFile: event.target.files?.[0] || null,
                      },
                    }))
                  }
                />
                {deal.invoiceUri ? (
                  <a href={deal.invoiceUri} target="_blank" rel="noreferrer" className="muted">
                    Mevcut faturayi ac
                  </a>
                ) : null}
                {currentDraft.invoiceFile ? (
                  <span className="muted">Hazir dosya: {currentDraft.invoiceFile.name}</span>
                ) : null}
              </label>

              <button
                type="button"
                className="button"
                disabled={!canDeliver || isDeliveryBusy}
                onClick={() => void submitDelivery(deal)}
              >
                {isDeliveryBusy ? 'Gonderiliyor...' : 'Police ve faturayi teslim et'}
              </button>
              {!canDeliver ? (
                <div className="muted">
                  Bu adim sadece odeme alindiktan sonra kullanilabilir.
                </div>
              ) : null}
            </div>
          </article>
        </section>
      </article>
    );
  };

  return (
    <AdminPageTemplate
      eyebrow="Insurance"
      title="Insurance operations"
      description="Garanti odemesi dogrulanmis listing anlasmalarinda teklif girisi, police/fatura yukleme ve teslim akislarini bu yuzeyden yonetin."
      metrics={metrics}
    >
      {notice ? (
        <section className="soft-card admin-panel-card">
          <p style={{ color: '#166534', margin: 0 }}>{notice}</p>
        </section>
      ) : null}

      {error ? (
        <section className="soft-card admin-panel-card">
          <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>
        </section>
      ) : null}

      {loading ? (
        <section className="soft-card admin-panel-card">
          <p className="muted" style={{ margin: 0 }}>
            Sigorta operasyon kayitlari yukleniyor...
          </p>
        </section>
      ) : null}

      {!loading && !error && !deals.length ? (
        <section className="soft-card admin-panel-card">
          <p className="muted" style={{ margin: 0 }}>
            Henuz sigorta surecine gecmis bir anlasma bulunmuyor.
          </p>
        </section>
      ) : null}

      {!loading && pendingDeals.length ? (
        <section className="admin-stack">
          <div className="eyebrow">Aktif isler</div>
          {pendingDeals.map(renderDealCard)}
        </section>
      ) : null}

      {!loading && deliveredDeals.length ? (
        <section className="admin-stack">
          <div className="eyebrow">Teslim edilenler</div>
          {deliveredDeals.map(renderDealCard)}
        </section>
      ) : null}
    </AdminPageTemplate>
  );
}
