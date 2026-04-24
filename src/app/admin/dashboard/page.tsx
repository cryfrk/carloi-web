'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { adminFeatureFlags } from '@/lib/admin/feature-flags';
import { requestAdminProxy } from '@/lib/client-api';

interface DashboardResponse {
  success: true;
  dashboard: {
    totalUsers: number;
    activeUsers: number;
    activeListings: number;
    pendingCommercialCount: number;
    listingComplianceQueueCount: number;
    failedPayments: number;
    activeSubscriptions: number;
    riskOverview: Array<{ severity: string; count: number }>;
    openRiskFlags: Array<{ id: string; type: string; severity: string; status: string }>;
  };
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse['dashboard'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    requestAdminProxy<DashboardResponse>('/dashboard')
      .then((response) => {
        if (mounted) {
          setDashboard(response.dashboard);
        }
      })
      .catch((cause) => {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : 'Dashboard verisi yuklenemedi.');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(
    () => [
      {
        label: 'Total users',
        value: String(dashboard?.totalUsers ?? '...'),
        helper: 'Kayitli toplam kullanici sayisi.',
      },
      {
        label: 'Active users',
        value: String(dashboard?.activeUsers ?? '...'),
        helper: 'Son 30 gunde en az bir icerik ureten kullanicilar.',
      },
      {
        label: 'Active listings',
        value: String(dashboard?.activeListings ?? '...'),
        helper: 'Yayinda kalan listing compliance kayitlari.',
      },
      {
        label: 'Commercial queue',
        value: String(dashboard?.pendingCommercialCount ?? '...'),
        helper: 'Platform review bekleyen ticari basvurular.',
      },
      {
        label: 'Open risk flags',
        value: String(dashboard?.openRiskFlags?.length ?? '...'),
        helper: 'Acil review isteyen acik risk kayitlari.',
      },
      {
        label: 'Failed payments',
        value: String(dashboard?.failedPayments ?? '...'),
        helper: 'Basarisiz veya iptal edilen odeme kayitlari.',
      },
    ],
    [dashboard],
  );

  return (
    <AdminPageTemplate
      eyebrow="Operations"
      title="Compliance rollout dashboard"
      description="Canli operasyon kuyruklari, risk hacmi ve billing sinyalleri bu ekranda toplanir."
      metrics={metrics}
      panels={[
        {
          title: 'Listing review queue',
          description: `Compliance inceleme bekleyen listing sayisi: ${dashboard?.listingComplianceQueueCount ?? '...'}.`,
        },
        {
          title: 'Subscription health',
          description: `Aktif abonelik sayisi: ${dashboard?.activeSubscriptions ?? '...'}.`,
        },
        {
          title: 'Risk overview',
          description:
            dashboard?.riskOverview?.length
              ? dashboard.riskOverview
                  .map((item) => `${item.severity}: ${item.count}`)
                  .join(' • ')
              : 'Risk severity dagilimi yukleniyor.',
        },
      ]}
    >
      {error ? (
        <section className="soft-card admin-panel-card">
          <p className="muted" style={{ margin: 0 }}>
            {error}
          </p>
        </section>
      ) : null}

      <section className="soft-card admin-panel-card">
        <h3 style={{ marginTop: 0 }}>Feature flag rollout board</h3>
        <div className="admin-flag-grid">
          {adminFeatureFlags.map((flag) => (
            <div key={flag.key} className="metric-card">
              <div className="eyebrow">Phase {flag.phase}</div>
              <strong style={{ display: 'block', marginTop: 8 }}>{flag.label}</strong>
              <div className="muted" style={{ marginTop: 10 }}>
                {flag.description}
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminPageTemplate>
  );
}
