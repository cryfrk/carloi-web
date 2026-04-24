'use client';

import { FormEvent, useEffect, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { adminFeatureFlags } from '@/lib/admin/feature-flags';
import { requestAdminProxy } from '@/lib/client-api';

interface BillingSettings {
  paidListingsEnabled: boolean;
  subscriptionRequiredForCommercial: boolean;
  individualListingFeeEnabled: boolean;
  featuredListingFeeEnabled: boolean;
  individualListingFeeAmount: string;
  featuredListingFeeAmount: string;
  currency: string;
}

const billingBooleanKeys = [
  ['paidListingsEnabled', 'Paid listings enabled'],
  ['subscriptionRequiredForCommercial', 'Commercial subscription required'],
  ['individualListingFeeEnabled', 'Individual listing fee'],
  ['featuredListingFeeEnabled', 'Featured listing fee'],
] as const;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BillingSettings | null>(null);
  const [reason, setReason] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    requestAdminProxy<{ success: true; settings: BillingSettings }>('/billing/settings')
      .then((response) => {
        if (mounted) {
          setSettings(response.settings);
        }
      })
      .catch((error) => {
        if (mounted) {
          setStatusMessage(error instanceof Error ? error.message : 'Billing ayarlari yuklenemedi.');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) {
      return;
    }

    if (!reason.trim()) {
      setStatusMessage('Pricing toggle veya ayar degisikligi icin gerekce zorunludur.');
      return;
    }

    const confirmed = window.confirm(
      'Billing ve pricing ayarlarini bu gerekce ile guncellemek istediginizden emin misiniz?',
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await requestAdminProxy<{ success: true; settings: BillingSettings; message: string }>(
        '/billing/settings',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...settings,
            reason,
          }),
        },
      );

      setSettings(response.settings);
      setStatusMessage(response.message || 'Billing ayarlari kaydedildi.');
      setReason('');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Billing ayarlari kaydedilemedi.');
    }
  }

  return (
    <AdminPageTemplate
      eyebrow="Settings"
      title="Rollout and pricing controls"
      description="Feature flag gorunumu korunur; billing toggles ve fiyat alanlari bu ekrandan admin reason ile guncellenir."
    >
      <section className="admin-panel-grid">
        <article className="soft-card admin-panel-card">
          <h3 style={{ marginTop: 0 }}>Billing settings</h3>
          {!settings ? (
            <p className="muted">Yukleniyor...</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
              {billingBooleanKeys.map(([key, label]) => (
                <label key={key} className="tag" style={{ justifyContent: 'space-between' }}>
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(event) =>
                      setSettings((current) =>
                        current
                          ? {
                              ...current,
                              [key]: event.target.checked,
                            }
                          : current,
                      )
                    }
                  />
                </label>
              ))}

              <input
                className="input"
                value={settings.individualListingFeeAmount}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? {
                          ...current,
                          individualListingFeeAmount: event.target.value,
                        }
                      : current,
                  )
                }
                placeholder="Individual listing fee amount"
              />
              <input
                className="input"
                value={settings.featuredListingFeeAmount}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? {
                          ...current,
                          featuredListingFeeAmount: event.target.value,
                        }
                      : current,
                  )
                }
                placeholder="Featured listing fee amount"
              />
              <input
                className="input"
                value={settings.currency}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? {
                          ...current,
                          currency: event.target.value.toUpperCase(),
                        }
                      : current,
                  )
                }
                placeholder="Currency"
              />
              <textarea
                className="textarea"
                placeholder="Pricing toggle veya ayar degisikligi icin gerekce yazin"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              <button className="button button-primary" type="submit">
                Billing ayarlarini kaydet
              </button>
            </form>
          )}
          {statusMessage ? <p className="muted" style={{ marginBottom: 0 }}>{statusMessage}</p> : null}
        </article>

        <article className="soft-card admin-panel-card">
          <h3 style={{ marginTop: 0 }}>Feature flags</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {adminFeatureFlags.map((flag) => (
              <div key={flag.key} style={{ borderBottom: '1px solid rgba(148,163,184,0.15)', paddingBottom: 10 }}>
                <strong>{flag.label}</strong>
                <div className="muted" style={{ marginTop: 4 }}>
                  Phase {flag.phase} - default {flag.defaultEnabled ? 'ON' : 'OFF'}
                </div>
                <div className="muted" style={{ marginTop: 4 }}>{flag.description}</div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AdminPageTemplate>
  );
}
