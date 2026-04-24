'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { requestAdminProxy } from '@/lib/client-api';

interface AdminListingRow {
  id: string;
  sellerName: string;
  sellerHandle: string;
  title: string;
  price: string;
  location: string;
  plateNumber?: string | null;
  listingComplianceStatus: string;
  authorizationStatus: string;
  eidsStatus: string;
  riskLevel: string;
  riskScore: number;
  duplicatePlateFlag: boolean;
  abnormalPriceFlag: boolean;
  spamContentFlag: boolean;
  suspiciousFlag: boolean;
  openRiskCount: number;
  reviewRequiredReason?: string | null;
  createdAt: string;
}

interface ListingFilters {
  q: string;
  status: string;
  riskLevel: string;
  suspicious: boolean;
  duplicatePlate: boolean;
  abnormalPrice: boolean;
}

const defaultFilters: ListingFilters = {
  q: '',
  status: '',
  riskLevel: '',
  suspicious: false,
  duplicatePlate: false,
  abnormalPrice: false,
};

function buildListingsQuery(filters: ListingFilters) {
  const params = new URLSearchParams();

  if (filters.q.trim()) {
    params.set('q', filters.q.trim());
  }
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.riskLevel) {
    params.set('riskLevel', filters.riskLevel);
  }
  if (filters.suspicious) {
    params.set('suspicious', 'true');
  }
  if (filters.duplicatePlate) {
    params.set('duplicatePlate', 'true');
  }
  if (filters.abnormalPrice) {
    params.set('abnormalPrice', 'true');
  }

  const query = params.toString();
  return query ? `/listings?${query}` : '/listings';
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListingFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<ListingFilters>(defaultFilters);

  const loadListings = async (activeFilters: ListingFilters) => {
    setLoading(true);
    try {
      const response = await requestAdminProxy<{ success: true; listings: AdminListingRow[] }>(
        buildListingsQuery(activeFilters),
      );
      setListings(response.listings || []);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Ilan listesi yuklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadListings(appliedFilters);
  }, [appliedFilters]);

  const metrics = useMemo(() => {
    return [
      {
        label: 'Toplam ilan',
        value: loading ? '...' : String(listings.length),
        helper: 'Aktif filtrelerle listelenen toplam ilan.',
      },
      {
        label: 'Suspicious',
        value: loading ? '...' : String(listings.filter((item) => item.suspiciousFlag).length),
        helper: 'Risk veya anomali sinyali tasiyan ilanlar.',
      },
      {
        label: 'Pending review',
        value: loading ? '...' : String(listings.filter((item) => item.listingComplianceStatus === 'submitted').length),
        helper: 'Manuel inceleme bekleyen ilanlar.',
      },
      {
        label: 'Rejected or suspended',
        value:
          loading
            ? '...'
            : String(
                listings.filter((item) =>
                  ['rejected', 'suspended'].includes(item.listingComplianceStatus),
                ).length,
              ),
        helper: 'Gorunurlugu kisitlanmis ilanlar.',
      },
    ];
  }, [listings, loading]);

  const mutateListing = async (listingId: string, action: 'suspend' | 'reject' | 'restore') => {
    const defaultReason =
      action === 'suspend'
        ? 'Ek inceleme gerekli'
        : action === 'reject'
          ? 'Uyumluluk kurallarini saglamiyor'
          : '';
    const reason = window.prompt(
      action === 'restore' ? 'Geri alma notu (opsiyonel)' : 'Moderation gerekcesi',
      defaultReason,
    ) || '';

    if (action !== 'restore' && !reason.trim()) {
      window.alert('Bu moderation islemi icin gerekce zorunludur.');
      return;
    }

    const confirmed = window.confirm(
      action === 'restore'
        ? 'Bu ilani tekrar aktif kuyruga almak istediginizden emin misiniz?'
        : `Bu ilani ${action === 'reject' ? 'reddetmek' : 'askiya almak'} istediginizden emin misiniz?`,
    );

    if (!confirmed) {
      return;
    }

    setPendingActionId(`${listingId}:${action}`);
    try {
      await requestAdminProxy(`/listings/${listingId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      await loadListings(appliedFilters);
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'Moderation islemi tamamlanamadi.');
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <AdminPageTemplate
      eyebrow="Listings"
      title="Listing compliance management"
      description="Compliance status, suspicious sinyaller, duplicate plate ve fiyat anomalileri canli endpointlerle yonetilir."
      metrics={metrics}
    >
      <section className="soft-card admin-panel-card">
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            alignItems: 'end',
          }}
        >
          <label>
            <div className="muted" style={{ marginBottom: 6 }}>
              Arama
            </div>
            <input
              className="input"
              placeholder="Ilan, satici veya plaka"
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            />
          </label>

          <label>
            <div className="muted" style={{ marginBottom: 6 }}>
              Compliance status
            </div>
            <select
              className="select"
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="">Tum durumlar</option>
              <option value="draft">draft</option>
              <option value="submitted">submitted</option>
              <option value="published">published</option>
              <option value="restricted">restricted</option>
              <option value="suspended">suspended</option>
              <option value="rejected">rejected</option>
            </select>
          </label>

          <label>
            <div className="muted" style={{ marginBottom: 6 }}>
              Risk seviyesi
            </div>
            <select
              className="select"
              value={filters.riskLevel}
              onChange={(event) => setFilters((current) => ({ ...current, riskLevel: event.target.value }))}
            >
              <option value="">Tum seviyeler</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </label>

          <label style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 46 }}>
            <input
              type="checkbox"
              checked={filters.suspicious}
              onChange={(event) => setFilters((current) => ({ ...current, suspicious: event.target.checked }))}
            />
            <span className="muted">Sadece suspicious</span>
          </label>

          <label style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 46 }}>
            <input
              type="checkbox"
              checked={filters.duplicatePlate}
              onChange={(event) =>
                setFilters((current) => ({ ...current, duplicatePlate: event.target.checked }))
              }
            />
            <span className="muted">Duplicate plate</span>
          </label>

          <label style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 46 }}>
            <input
              type="checkbox"
              checked={filters.abnormalPrice}
              onChange={(event) =>
                setFilters((current) => ({ ...current, abnormalPrice: event.target.checked }))
              }
            />
            <span className="muted">Price anomaly</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
          <button className="button button-primary" onClick={() => setAppliedFilters({ ...filters })} type="button">
            Filtreleri uygula
          </button>
          <button
            className="button button-secondary"
            onClick={() => {
              setFilters(defaultFilters);
              setAppliedFilters(defaultFilters);
            }}
            type="button"
          >
            Sifirla
          </button>
          <button className="button button-secondary" onClick={() => void loadListings(appliedFilters)} type="button">
            Yenile
          </button>
        </div>
      </section>

      <section className="soft-card admin-panel-card">
        {error ? <p style={{ color: '#b91c1c', marginTop: 0 }}>{error}</p> : null}
        {loading ? <p className="muted">Ilan listesi yukleniyor...</p> : null}
        {!loading && !error && listings.length === 0 ? (
          <p className="muted">Secili filtrelerle eslesen ilan kaydi bulunmuyor.</p>
        ) : null}

        {!loading && !error && listings.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Ilan', 'Satici', 'Compliance', 'Risk', 'Flags', 'Moderation'].map((header) => (
                    <th
                      key={header}
                      style={{
                        textAlign: 'left',
                        padding: '12px 10px',
                        borderBottom: '1px solid rgba(148,163,184,0.2)',
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => {
                  const isSuspended = listing.listingComplianceStatus === 'suspended';
                  const isRejected = listing.listingComplianceStatus === 'rejected';

                  return (
                    <tr key={listing.id}>
                      <td style={{ padding: '12px 10px' }}>
                        <strong>{listing.title}</strong>
                        <div className="muted">
                          {listing.price} - {listing.location}
                        </div>
                        {listing.plateNumber ? (
                          <div className="muted" style={{ marginTop: 4 }}>
                            plate: {listing.plateNumber}
                          </div>
                        ) : null}
                        {listing.reviewRequiredReason ? (
                          <div className="muted" style={{ marginTop: 4 }}>
                            note: {listing.reviewRequiredReason}
                          </div>
                        ) : null}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <strong>{listing.sellerName}</strong>
                        <div className="muted">{listing.sellerHandle}</div>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {listing.listingComplianceStatus}
                        <div className="muted" style={{ marginTop: 4 }}>
                          {listing.authorizationStatus} - {listing.eidsStatus}
                        </div>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {listing.riskLevel} ({listing.riskScore})
                        <div className="muted" style={{ marginTop: 4 }}>
                          open flags: {listing.openRiskCount}
                        </div>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div className="muted">
                          {listing.duplicatePlateFlag ? 'duplicate plate' : 'duplicate plate yok'}
                        </div>
                        <div className="muted">
                          {listing.abnormalPriceFlag ? 'price anomaly' : 'price normal'}
                        </div>
                        <div className="muted">
                          {listing.spamContentFlag ? 'spam signal' : 'spam signal yok'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {(isSuspended || isRejected) ? (
                            <button
                              className="button button-secondary"
                              disabled={pendingActionId === `${listing.id}:restore`}
                              onClick={() => void mutateListing(listing.id, 'restore')}
                              type="button"
                            >
                              {pendingActionId === `${listing.id}:restore` ? 'Calisiyor...' : 'Restore'}
                            </button>
                          ) : (
                            <>
                              <button
                                className="button button-secondary"
                                disabled={pendingActionId === `${listing.id}:suspend`}
                                onClick={() => void mutateListing(listing.id, 'suspend')}
                                type="button"
                              >
                                {pendingActionId === `${listing.id}:suspend` ? 'Calisiyor...' : 'Suspend'}
                              </button>
                              <button
                                className="button button-secondary"
                                disabled={pendingActionId === `${listing.id}:reject`}
                                onClick={() => void mutateListing(listing.id, 'reject')}
                                type="button"
                              >
                                {pendingActionId === `${listing.id}:reject` ? 'Calisiyor...' : 'Reject'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </AdminPageTemplate>
  );
}
