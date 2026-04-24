'use client';

import Image from 'next/image';

import styles from '@/components/payment/payment-page.module.css';
import type { ExternalPaymentSession } from '@/lib/types';

interface SecurePaymentTransitionPanelProps {
  payment: ExternalPaymentSession;
  onContinue: () => void;
  onCancel: () => void;
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <article className={styles.summaryItem}>
      <span className={styles.summaryLabel}>{label}</span>
      <span className={`${styles.summaryValue} ${styles.summaryValueStrong}`}>{value || '-'}</span>
    </article>
  );
}

function formatAmount(amount?: string, currency?: string) {
  return amount ? `${amount}${currency ? ` ${currency}` : ''}` : '-';
}

export function SecurePaymentTransitionPanel({
  payment,
  onContinue,
  onCancel,
}: SecurePaymentTransitionPanelProps) {
  return (
    <div className={styles.transitionOverlay} role="dialog" aria-modal="true">
      <div className={styles.transitionPanel}>
        <section className={styles.header}>
          <div className={styles.headerGlow} aria-hidden="true" />
          <div className={styles.headerRow}>
            <div className={styles.brandRow}>
              <div className={styles.logoWrap}>
                <Image alt="Carloi" height={60} src="/carloi.png" width={60} />
              </div>
              <div className={styles.brandMeta}>
                <span className={styles.securePill}>
                  <span className={styles.secureDot} aria-hidden="true" />
                  Guvenli odeme gecisi
                </span>
                <h2 className={styles.title} style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)' }}>
                  Sigorta odemenizi guvenli sekilde tamamlayin
                </h2>
              </div>
            </div>

            <p className={styles.transitionDescription}>
              Bir sonraki adimda Carloi&apos;nin guvenli odeme sayfasina yonlendirileceksiniz. Odeme islemi
              banka guvenlik altyapisi uzerinden tamamlanir. Kart bilgileriniz Carloi uygulamasinda saklanmaz.
            </p>
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Odeme Ozeti</p>
          <h3 className={styles.cardTitle}>Arac ve islem bilgisi</h3>
          <div className={styles.summaryGrid}>
            <SummaryRow label="Arac" value={payment.vehicleSummary?.title} />
            <SummaryRow label="Plaka" value={payment.vehicleSummary?.plateNumber} />
            <SummaryRow label="Sigorta tipi" value={payment.insuranceType} />
            <SummaryRow label="Toplam tutar" value={formatAmount(payment.amount, payment.currency)} />
            <SummaryRow label="Islem numarasi" value={payment.paymentReference} />
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Guven Bilgisi</p>
          <h3 className={styles.cardTitle}>Neler olacak?</h3>
          <div className={styles.transitionBulletStack}>
            <div className={styles.transitionBullet}>
              <span className={styles.transitionBulletIcon}>1</span>
              <span>Banka guvenlik ekraninda odeme yapilir</span>
            </div>
            <div className={styles.transitionBullet}>
              <span className={styles.transitionBulletIcon}>2</span>
              <span>Kart bilgileriniz Carloi&apos;de tutulmaz</span>
            </div>
            <div className={styles.transitionBullet}>
              <span className={styles.transitionBulletIcon}>3</span>
              <span>Odeme sonrasi uygulamaya geri donersiniz</span>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.transitionActions}>
            <button className={styles.ctaPrimary} type="button" onClick={onContinue}>
              Guvenli Odemeye Gec
            </button>
            <button className={styles.ctaSecondary} type="button" onClick={onCancel}>
              Vazgec
            </button>
          </div>
          <p className={styles.ctaHint} style={{ marginTop: 12 }}>
            Odeme tamamlandiktan sonra police ve fatura size e-posta ve Carloi mesaji ile iletilecektir.
          </p>
        </section>
      </div>
    </div>
  );
}
