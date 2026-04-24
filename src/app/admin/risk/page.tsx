'use client';

import { useEffect, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { requestAdminProxy } from '@/lib/client-api';

interface RiskFlagRow {
  id: string;
  user_id: string;
  related_listing_id?: string | null;
  type: string;
  severity: string;
  source: string;
  status: string;
  notes?: string | null;
  created_at: string;
}

interface RiskResponse {
  success: true;
  overview: Array<{ severity: string; count: number }>;
  riskFlags: RiskFlagRow[];
  openRiskFlags: RiskFlagRow[];
}

export default function AdminRiskPage() {
  const [data, setData] = useState<RiskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    requestAdminProxy<RiskResponse>('/risk')
      .then((response) => {
        if (mounted) {
          setData(response);
        }
      })
      .catch((cause) => {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : 'Risk queue yuklenemedi.');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminPageTemplate
      eyebrow="Risk"
      title="Risk flags and behavior heuristics"
      description="Duplicate plate, excessive sales, suspicious document ve benzeri sistem sinyallerini bu kuyrukta inceleyebilirsin."
      metrics={[
        {
          label: 'Open flags',
          value: String(data?.openRiskFlags.length ?? '...'),
          helper: 'Henüz kapanmamis risk flag sayisi.',
        },
        {
          label: 'Severity summary',
          value:
            data?.overview?.length
              ? data.overview.map((item) => `${item.severity}:${item.count}`).join(' • ')
              : '...',
          helper: 'Severity bazli risk hacmi.',
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
        <h3 style={{ marginTop: 0 }}>Open risk queue</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {(data?.riskFlags || []).map((flag) => (
            <article key={flag.id} className="support-card">
              <div className="eyebrow">
                {flag.severity} • {flag.status}
              </div>
              <strong style={{ display: 'block', marginTop: 8 }}>{flag.type}</strong>
              <div className="muted" style={{ marginTop: 8 }}>
                user: {flag.user_id} {flag.related_listing_id ? `• listing: ${flag.related_listing_id}` : ''}
              </div>
              {flag.notes ? (
                <div className="muted" style={{ marginTop: 8 }}>
                  {flag.notes}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </AdminPageTemplate>
  );
}
