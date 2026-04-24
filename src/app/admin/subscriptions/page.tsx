'use client';

import { useEffect, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { requestAdminProxy } from '@/lib/client-api';

interface PlanRow {
  id: string;
  name: string;
  code: string;
  monthlyPrice: string;
  currency: string;
  isCommercialOnly: boolean;
  isActive: boolean;
}

interface SubscriptionRow {
  id: string;
  userName: string;
  userHandle: string;
  planName: string;
  planCode: string;
  status: string;
  renewalAt?: string | null;
}

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      requestAdminProxy<{ success: true; plans: PlanRow[] }>('/billing/plans'),
      requestAdminProxy<{ success: true; subscriptions: SubscriptionRow[] }>('/subscriptions'),
    ])
      .then(([plansResponse, subscriptionsResponse]) => {
        if (!mounted) {
          return;
        }

        setPlans(plansResponse.plans || []);
        setSubscriptions(subscriptionsResponse.subscriptions || []);
      })
      .catch((nextError) => {
        if (mounted) {
          setError(nextError instanceof Error ? nextError.message : 'Abonelik verileri yuklenemedi.');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminPageTemplate
      eyebrow="Subscriptions"
      title="Subscription and listing monetization"
      description="Plan katalogu, aktif abonelikler ve ticari hesaplar icin monetization enforcement gorunumu."
      metrics={[
        {
          label: 'Plan sayisi',
          value: String(plans.length),
          helper: 'SubscriptionPlan katalogunda aktif veya pasif tutulan planlar',
        },
        {
          label: 'Abonelik kaydi',
          value: String(subscriptions.length),
          helper: 'trial, active, past_due ve cancelled durumlari dahil',
        },
      ]}
    >
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

      <section className="admin-panel-grid">
        <article className="soft-card admin-panel-card">
          <h3 style={{ marginTop: 0 }}>Plan catalog</h3>
          {!plans.length ? <p className="muted">Henuz tanimli subscription plan yok.</p> : null}
          {plans.map((plan) => (
            <div key={plan.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
              <strong>{plan.name}</strong>
              <div className="muted" style={{ marginTop: 4 }}>
                {plan.code} • {plan.monthlyPrice} {plan.currency} • {plan.isCommercialOnly ? 'Commercial only' : 'Genel plan'} • {plan.isActive ? 'Active' : 'Pasif'}
              </div>
            </div>
          ))}
        </article>

        <article className="soft-card admin-panel-card">
          <h3 style={{ marginTop: 0 }}>User subscriptions</h3>
          {!subscriptions.length ? <p className="muted">Henuz aktif subscription kaydi yok.</p> : null}
          {subscriptions.map((subscription) => (
            <div key={subscription.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
              <strong>{subscription.userName}</strong>
              <div className="muted" style={{ marginTop: 4 }}>
                {subscription.userHandle} • {subscription.planName} ({subscription.planCode}) • {subscription.status}
              </div>
              {subscription.renewalAt ? (
                <div className="muted" style={{ marginTop: 4 }}>
                  Renewal: {subscription.renewalAt}
                </div>
              ) : null}
            </div>
          ))}
        </article>
      </section>
    </AdminPageTemplate>
  );
}
