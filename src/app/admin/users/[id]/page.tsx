'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { requestAdminProxy } from '@/lib/client-api';

interface AdminUserDetail {
  id: string;
  name: string;
  handle: string;
  bio: string;
  email: string;
  phone: string;
  verified: boolean;
  accountType: string;
  commercialStatus: string;
  commercialApprovedAt?: string | null;
  commercialRejectedReason?: string | null;
  riskLevel: string;
  riskScore: number;
  yearlyVehicleSaleCount: number;
  yearlyVehicleListingCount: number;
  commercialBehaviorFlag: boolean;
  subscriptionStatus: string;
  lastLoginIp?: string | null;
  lastKnownDeviceFingerprint?: string | null;
  createdAt: string;
  updatedAt: string;
  consents: Array<{
    consentType: string;
    version: string;
    acceptedAt: string;
    sourceScreen: string;
  }>;
  riskFlags: Array<{
    id: string;
    type: string;
    severity: string;
    status: string;
    notes?: string | null;
    relatedListingId?: string | null;
    createdAt: string;
  }>;
  auditSummary: Array<{
    id: string;
    action: string;
    actorType: string;
    createdAt: string;
    targetType: string;
    targetId?: string | null;
  }>;
  listingSummary: Array<{
    id: string;
    title: string;
    price: string;
    location: string;
    listingComplianceStatus: string;
    authorizationStatus: string;
    riskLevel: string;
    billingStatus: string;
    createdAt: string;
  }>;
  paymentSummary: {
    totalCount: number;
    paidCount: number;
    failedCount: number;
    latestAt?: string | null;
    items: Array<{
      id: string;
      type: string;
      status: string;
      amount?: string;
      currency?: string;
      provider?: string;
      createdAt: string;
    }>;
  };
  commercialProfile?: {
    id: string;
    companyName: string;
    status: string;
    city: string;
    district: string;
    submittedAt?: string | null;
    updatedAt: string;
  } | null;
  adminRoles?: Array<{
    roleKey: string;
    assignedAt: string;
  }>;
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) {
      return;
    }

    let mounted = true;
    setLoading(true);

    requestAdminProxy<{ success: true; user: AdminUserDetail }>(`/users/${params.id}`)
      .then((response) => {
        if (mounted) {
          setUser(response.user);
          setError(null);
        }
      })
      .catch((cause) => {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : 'Kullanici detayi yuklenemedi.');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [params?.id]);

  return (
    <AdminPageTemplate
      eyebrow="User detail"
      title={user ? `${user.name} ${user.handle}` : 'User detail'}
      description="Kullanici detaylari, listing ozetleri, odeme kayitlari, risk flagleri ve audit trail ayni ekranda toplanir."
      metrics={[
        {
          label: 'Risk',
          value: user ? `${user.riskLevel} (${user.riskScore})` : '...',
          helper: 'Kullanici risk seviye ve skoru.',
        },
        {
          label: 'Yillik ilan / satis',
          value: user ? `${user.yearlyVehicleListingCount} / ${user.yearlyVehicleSaleCount}` : '...',
          helper: 'Davranis sinyali ve ticari esik takibi.',
        },
        {
          label: 'Payment summary',
          value: user ? `${user.paymentSummary.totalCount} kayit` : '...',
          helper: 'Rol izinlerine gore sinirli gosterilebilir.',
        },
      ]}
    >
      <section className="soft-card admin-panel-card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/admin/users" className="button button-secondary">
          Listeye don
        </Link>
        <Link href="/admin/payments" className="button button-secondary">
          Payments
        </Link>
      </section>

      {error ? (
        <section className="soft-card admin-panel-card">
          <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>
        </section>
      ) : null}

      {loading ? (
        <section className="soft-card admin-panel-card">
          <p className="muted" style={{ margin: 0 }}>
            Kullanici detayi yukleniyor...
          </p>
        </section>
      ) : null}

      {!loading && !error && !user ? (
        <section className="soft-card admin-panel-card">
          <p className="muted" style={{ margin: 0 }}>
            Kullanici kaydi bulunamadi.
          </p>
        </section>
      ) : null}

      {user ? (
        <>
          <section className="admin-panel-grid">
            <article className="soft-card admin-panel-card">
              <h3 style={{ marginTop: 0 }}>Overview</h3>
              <p className="muted">email: {user.email || 'belirtilmedi'}</p>
              <p className="muted">phone: {user.phone || 'belirtilmedi'}</p>
              <p className="muted">accountType: {user.accountType}</p>
              <p className="muted">commercialStatus: {user.commercialStatus}</p>
              <p className="muted">subscriptionStatus: {user.subscriptionStatus}</p>
              <p className="muted">createdAt: {user.createdAt}</p>
              <p className="muted">updatedAt: {user.updatedAt}</p>
              <p className="muted">lastLoginIp: {user.lastLoginIp || 'yok'}</p>
              <p className="muted" style={{ marginBottom: 0 }}>
                fingerprint: {user.lastKnownDeviceFingerprint || 'yok'}
              </p>
            </article>

            <article className="soft-card admin-panel-card">
              <h3 style={{ marginTop: 0 }}>Commercial and roles</h3>
              {user.commercialProfile ? (
                <>
                  <p className="muted">company: {user.commercialProfile.companyName}</p>
                  <p className="muted">status: {user.commercialProfile.status}</p>
                  <p className="muted">
                    location: {user.commercialProfile.city} / {user.commercialProfile.district}
                  </p>
                  <p className="muted">
                    submittedAt: {user.commercialProfile.submittedAt || 'yok'}
                  </p>
                </>
              ) : (
                <p className="muted">Commercial profil kaydi bulunmuyor.</p>
              )}
              {user.commercialRejectedReason ? (
                <p className="muted">rejectReason: {user.commercialRejectedReason}</p>
              ) : null}
              <div className="muted" style={{ marginTop: 8 }}>
                admin roles:{' '}
                {user.adminRoles?.length
                  ? user.adminRoles.map((role) => role.roleKey).join(', ')
                  : 'atanmamis'}
              </div>
            </article>

            <article className="soft-card admin-panel-card">
              <h3 style={{ marginTop: 0 }}>Payment summary</h3>
              <p className="muted">Toplam: {user.paymentSummary.totalCount}</p>
              <p className="muted">Paid: {user.paymentSummary.paidCount}</p>
              <p className="muted">Failed: {user.paymentSummary.failedCount}</p>
              <p className="muted" style={{ marginBottom: 0 }}>
                Son kayit: {user.paymentSummary.latestAt || 'yok'}
              </p>
            </article>
          </section>

          <section className="soft-card admin-panel-card">
            <h3 style={{ marginTop: 0 }}>Consent history</h3>
            {!user.consents.length ? <p className="muted">Consent kaydi bulunmuyor.</p> : null}
            <div style={{ display: 'grid', gap: 10 }}>
              {user.consents.map((consent) => (
                <article key={`${consent.consentType}-${consent.version}-${consent.acceptedAt}`} className="support-card">
                  <strong>{consent.consentType}</strong>
                  <div className="muted" style={{ marginTop: 6 }}>
                    version {consent.version} - {consent.sourceScreen} - {consent.acceptedAt}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-panel-grid">
            <article className="soft-card admin-panel-card">
              <h3 style={{ marginTop: 0 }}>Risk flags</h3>
              {!user.riskFlags.length ? <p className="muted">Risk flag bulunmuyor.</p> : null}
              <div style={{ display: 'grid', gap: 10 }}>
                {user.riskFlags.map((flag) => (
                  <article key={flag.id} className="support-card">
                    <strong>{flag.type}</strong>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {flag.severity} - {flag.status} - {flag.createdAt}
                    </div>
                    {flag.relatedListingId ? (
                      <div className="muted" style={{ marginTop: 6 }}>
                        listing: {flag.relatedListingId}
                      </div>
                    ) : null}
                    {flag.notes ? (
                      <div className="muted" style={{ marginTop: 6 }}>
                        {flag.notes}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </article>

            <article className="soft-card admin-panel-card">
              <h3 style={{ marginTop: 0 }}>Audit summary</h3>
              {!user.auditSummary.length ? <p className="muted">Audit kaydi bulunmuyor.</p> : null}
              <div style={{ display: 'grid', gap: 10 }}>
                {user.auditSummary.map((entry) => (
                  <article key={entry.id} className="support-card">
                    <strong>{entry.action}</strong>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {entry.actorType} - {entry.targetType}
                      {entry.targetId ? ` - ${entry.targetId}` : ''} - {entry.createdAt}
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </section>

          <section className="soft-card admin-panel-card">
            <h3 style={{ marginTop: 0 }}>Listing summary</h3>
            {!user.listingSummary.length ? <p className="muted">Ilan ozeti bulunmuyor.</p> : null}
            {user.listingSummary.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Ilan', 'Fiyat', 'Konum', 'Compliance', 'Risk', 'Billing', 'Tarih'].map((header) => (
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
                    {user.listingSummary.map((listing) => (
                      <tr key={listing.id}>
                        <td style={{ padding: '12px 10px' }}>{listing.title}</td>
                        <td style={{ padding: '12px 10px' }}>{listing.price}</td>
                        <td style={{ padding: '12px 10px' }}>{listing.location}</td>
                        <td style={{ padding: '12px 10px' }}>{listing.listingComplianceStatus}</td>
                        <td style={{ padding: '12px 10px' }}>{listing.riskLevel}</td>
                        <td style={{ padding: '12px 10px' }}>{listing.billingStatus}</td>
                        <td style={{ padding: '12px 10px' }}>{listing.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

          <section className="soft-card admin-panel-card">
            <h3 style={{ marginTop: 0 }}>Payment items</h3>
            {!user.paymentSummary.items.length ? <p className="muted">Payment kaydi bulunmuyor.</p> : null}
            <div style={{ display: 'grid', gap: 10 }}>
              {user.paymentSummary.items.map((payment) => (
                <article key={payment.id} className="support-card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <strong>{payment.type}</strong>
                    <Link href={`/admin/payments/${payment.id}`} className="button button-secondary">
                      Payment detail
                    </Link>
                  </div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    {payment.status}
                    {payment.amount && payment.currency ? ` - ${payment.amount} ${payment.currency}` : ''}
                    {payment.provider ? ` - ${payment.provider}` : ''} - {payment.createdAt}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </AdminPageTemplate>
  );
}
