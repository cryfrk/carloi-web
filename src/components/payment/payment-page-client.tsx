'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { PaymentAmountCard } from '@/components/payment/payment-amount-card';
import { PaymentCTASection } from '@/components/payment/payment-cta-section';
import { PaymentFooter } from '@/components/payment/payment-footer';
import { PaymentHeader } from '@/components/payment/payment-header';
import styles from '@/components/payment/payment-page.module.css';
import { PaymentResultCard } from '@/components/payment/payment-result-card';
import { PaymentTrustInfo } from '@/components/payment/payment-trust-info';
import { VehicleSummaryCard } from '@/components/payment/vehicle-summary-card';
import { requestProxy } from '@/lib/client-api';
import { webEnv } from '@/lib/env';
import type { ExternalPaymentSession } from '@/lib/types';

type PaymentDisplayState = 'redirecting' | 'success' | 'failed' | 'cancelled';

function openExternalUrl(url?: string) {
  if (!url || typeof window === 'undefined') {
    return;
  }

  window.location.assign(url);
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const paymentReference = String(searchParams.get('paymentReference') || '').trim();
  const resultStatus = String(searchParams.get('status') || '').trim().toLowerCase();

  const [session, setSession] = useState<ExternalPaymentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!paymentReference) {
      setLoading(false);
      setError('Odeme oturumu bulunamadi.');
      return;
    }

    let mounted = true;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    requestProxy<{ success: true; data: ExternalPaymentSession }>(`/api/payment/session/${paymentReference}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!mounted) {
          return;
        }
        setSession(response.data);
      })
      .catch((cause) => {
        if (!mounted || controller.signal.aborted) {
          return;
        }

        setError(cause instanceof Error ? cause.message : 'Odeme oturumu yuklenemedi.');
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [paymentReference]);

  const state = useMemo<PaymentDisplayState>(() => {
    if (resultStatus === 'success' || resultStatus === 'failed' || resultStatus === 'cancelled') {
      return resultStatus;
    }

    if (session?.status === 'paid' || session?.status === 'success') {
      return 'success';
    }

    if (session?.status === 'cancelled') {
      return 'cancelled';
    }

    if (session?.status === 'failed') {
      return 'failed';
    }

    return 'redirecting';
  }, [resultStatus, session?.status]);

  useEffect(() => {
    if (state !== 'redirecting' || !session?.gatewayUrl) {
      return;
    }

    setCountdown(4);
    const interval = window.setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    const timer = window.setTimeout(() => {
      openExternalUrl(session.gatewayUrl);
    }, 3600);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [state, session?.gatewayUrl]);

  const appReturnUrl =
    state === 'success'
      ? session?.returnUrls?.appSuccessUrl
      : state === 'cancelled'
        ? session?.returnUrls?.appCancelledUrl || session?.returnUrls?.appFailureUrl
        : state === 'failed'
          ? session?.returnUrls?.appFailureUrl
          : undefined;

  const cancelReturnUrl = session?.returnUrls?.appCancelledUrl || session?.returnUrls?.appFailureUrl;
  const webFallbackUrl =
    state === 'success'
      ? session?.returnUrls?.webSuccessUrl || '/'
      : state === 'cancelled'
        ? session?.returnUrls?.webCancelledUrl || session?.returnUrls?.webFailureUrl || '/'
        : state === 'failed'
          ? session?.returnUrls?.webFailureUrl || '/'
          : session?.returnUrls?.webCancelledUrl || session?.returnUrls?.webFailureUrl || '/';

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <PaymentHeader
          appName={webEnv.appName}
          providerName={session?.providerName || 'Garanti Virtual POS'}
        />

        <div className={styles.contentGrid}>
          <div className={styles.contentColumn}>
            <VehicleSummaryCard loading={loading} session={session} />
            <PaymentTrustInfo trustMessage={session?.trustMessage} />
            {error ? (
              <section className={styles.card}>
                <p className={styles.cardEyebrow}>Session</p>
                <h2 className={styles.cardTitle}>Odeme bilgisi yuklenemedi</h2>
                <p className={styles.errorText}>{error}</p>
                <Link className={styles.ctaSecondary} href="/">
                  Carloi ana sayfasina don
                </Link>
              </section>
            ) : null}
          </div>

          <div className={styles.contentColumn}>
            <PaymentAmountCard loading={loading} session={session} />
            {loading ? (
              <section className={styles.card}>
                <p className={styles.cardEyebrow}>Preparing</p>
                <h2 className={styles.cardTitle}>Guvenli odeme sayfasi hazirlaniyor</h2>
                <div className={styles.loadingBlock} aria-hidden="true">
                  <div className={styles.loadingLine} />
                  <div className={styles.loadingLineShort} />
                  <div className={styles.loadingLine} />
                </div>
              </section>
            ) : null}

            {!loading && !error && state !== 'redirecting' ? <PaymentResultCard state={state} /> : null}

            {session ? (
              <PaymentCTASection
                appReturnUrl={appReturnUrl}
                cancelReturnUrl={cancelReturnUrl}
                countdown={countdown}
                gatewayUrl={session.gatewayUrl}
                state={state}
                webFallbackUrl={webFallbackUrl}
              />
            ) : null}
          </div>
        </div>

        <PaymentFooter
          privacyUrl={webEnv.privacyUrl}
          supportEmail={webEnv.supportEmail}
          termsUrl={webEnv.termsUrl}
        />
      </div>
    </main>
  );
}

export function PaymentPageClient() {
  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <div className={styles.shell}>
            <PaymentHeader appName={webEnv.appName} providerName="Garanti Virtual POS" />
            <section className={styles.card}>
              <p className={styles.cardEyebrow}>Preparing</p>
              <h2 className={styles.cardTitle}>Odeme sayfasi hazirlaniyor</h2>
              <div className={styles.loadingBlock} aria-hidden="true">
                <div className={styles.loadingLine} />
                <div className={styles.loadingLineShort} />
                <div className={styles.loadingLine} />
              </div>
            </section>
          </div>
        </main>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
