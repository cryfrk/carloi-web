'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { requestAdminProxy } from '@/lib/client-api';

interface AdminPaymentRow {
  id: string;
  userName: string;
  userHandle: string;
  listingTitle: string;
  type: string;
  amount: string;
  currency: string;
  provider: string;
  status: string;
  createdAt?: string | null;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    requestAdminProxy<{ success: true; payments: AdminPaymentRow[] }>('/payments')
      .then((response) => {
        if (mounted) {
          setPayments(response.payments || []);
        }
      })
      .catch((nextError) => {
        if (mounted) {
          setError(nextError instanceof Error ? nextError.message : 'Ödeme kayıtları yüklenemedi.');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminPageTemplate
      eyebrow="Payments"
      title="Payment operations"
      description="PaymentRecord akisi, callback sonucu onaylanan odemeler ve tekrar deneme gereken kayitlar burada toplanir."
      metrics={[
        {
          label: 'Toplam kayit',
          value: String(payments.length),
          helper: 'subscription, listing_fee, featured_listing ve insurance_related satirlari',
        },
      ]}
    >
      <section className="soft-card admin-panel-card">
        {error ? <p style={{ color: '#b91c1c', marginTop: 0 }}>{error}</p> : null}
        {!error && !payments.length ? <p className="muted">Henuz payment record bulunmuyor.</p> : null}
        {payments.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Tip', 'Kullanici', 'Ilan', 'Tutar', 'Provider', 'Durum', 'Detay'].map((header) => (
                    <th key={header} style={{ textAlign: 'left', padding: '12px 10px', borderBottom: '1px solid rgba(148,163,184,0.2)' }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td style={{ padding: '12px 10px' }}>{payment.type}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <strong>{payment.userName}</strong>
                      <div className="muted">{payment.userHandle}</div>
                    </td>
                    <td style={{ padding: '12px 10px' }}>{payment.listingTitle || '—'}</td>
                    <td style={{ padding: '12px 10px' }}>
                      {payment.amount} {payment.currency}
                    </td>
                    <td style={{ padding: '12px 10px' }}>{payment.provider}</td>
                    <td style={{ padding: '12px 10px' }}>{payment.status}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <Link href={`/admin/payments/${payment.id}`} className="button button-secondary">
                        Ac
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </AdminPageTemplate>
  );
}
