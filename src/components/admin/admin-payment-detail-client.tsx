'use client';

import { useEffect, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { requestAdminProxy } from '@/lib/client-api';

interface PaymentDetail {
  id: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  provider: string;
  userName: string;
  userHandle: string;
  listingTitle: string;
  externalRef?: string | null;
  metadata?: Record<string, unknown>;
}

export function AdminPaymentDetailClient({ paymentId }: { paymentId: string }) {
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    requestAdminProxy<{ success: true; payment: PaymentDetail }>(`/payments/${paymentId}`)
      .then((response) => {
        if (mounted) {
          setPayment(response.payment);
        }
      })
      .catch((nextError) => {
        if (mounted) {
          setError(nextError instanceof Error ? nextError.message : 'Odeme detayi yuklenemedi.');
        }
      });

    return () => {
      mounted = false;
    };
  }, [paymentId]);

  return (
    <AdminPageTemplate
      eyebrow="Payment detail"
      title={payment ? `${payment.type} • ${payment.status}` : 'Payment detail'}
      description="Backend onayli odeme kaydi, provider referansi ve callback metadata gorunumu."
    >
      <section className="soft-card admin-panel-card">
        {error ? <p style={{ color: '#b91c1c', marginTop: 0 }}>{error}</p> : null}
        {payment ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <div><strong>Kullanici:</strong> {payment.userName} ({payment.userHandle})</div>
            <div><strong>Ilan:</strong> {payment.listingTitle || '—'}</div>
            <div><strong>Tutar:</strong> {payment.amount} {payment.currency}</div>
            <div><strong>Provider:</strong> {payment.provider}</div>
            <div><strong>External ref:</strong> {payment.externalRef || '—'}</div>
            <div>
              <strong>Metadata</strong>
              <pre style={{ margin: '8px 0 0', padding: 14, borderRadius: 16, background: 'rgba(15,23,42,0.92)', color: '#e2e8f0', overflowX: 'auto' }}>
                {JSON.stringify(payment.metadata || {}, null, 2)}
              </pre>
            </div>
          </div>
        ) : !error ? (
          <p className="muted">Yukleniyor…</p>
        ) : null}
      </section>
    </AdminPageTemplate>
  );
}
