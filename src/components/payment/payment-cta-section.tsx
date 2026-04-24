import Link from 'next/link';

import styles from '@/components/payment/payment-page.module.css';

interface PaymentCTASectionProps {
  state: 'redirecting' | 'success' | 'failed' | 'cancelled';
  countdown?: number;
  gatewayUrl?: string;
  appReturnUrl?: string;
  cancelReturnUrl?: string;
  webFallbackUrl?: string;
}

function navigateTo(url?: string) {
  if (!url || typeof window === 'undefined') {
    return;
  }

  window.location.assign(url);
}

export function PaymentCTASection({
  state,
  countdown,
  gatewayUrl,
  appReturnUrl,
  cancelReturnUrl,
  webFallbackUrl = '/',
}: PaymentCTASectionProps) {
  if (state === 'redirecting') {
    return (
      <section className={styles.card}>
        <p className={styles.cardEyebrow}>Action</p>
        <h2 className={styles.cardTitle}>Odeme adimina hazirsiniz</h2>
        <div className={styles.ctaBlock}>
          <button
            className={styles.ctaPrimary}
            type="button"
            onClick={() => navigateTo(gatewayUrl)}
          >
            Guvenli Odemeye Devam Et
          </button>
          <button
            className={styles.ctaSecondary}
            type="button"
            onClick={() => navigateTo(cancelReturnUrl || webFallbackUrl)}
          >
            Vazgec ve uygulamaya don
          </button>
          <p className={styles.ctaHint}>
            <span className={styles.ctaHintStrong}>Kisa sure sonra otomatik yonlendirileceksiniz.</span>
            {countdown !== undefined ? ` Yaklasik ${countdown} sn kaldi.` : ' Hazir oldugunuzda hemen devam edebilirsiniz.'}
          </p>
        </div>
      </section>
    );
  }

  const secondaryHref = webFallbackUrl || '/';

  return (
    <section className={styles.card}>
      <p className={styles.cardEyebrow}>Return</p>
      <h2 className={styles.cardTitle}>Carloi&apos;ye geri donun</h2>
      <div className={styles.ctaBlock}>
        {appReturnUrl ? (
          <button className={styles.ctaPrimary} type="button" onClick={() => navigateTo(appReturnUrl)}>
            Uygulamaya don
          </button>
        ) : (
          <Link className={styles.ctaPrimary} href={secondaryHref}>
            Carloi&apos;ye devam et
          </Link>
        )}
        <Link className={styles.ctaSecondary} href={secondaryHref}>
          Webe devam et
        </Link>
        <p className={styles.ctaHint}>
          Durumunuz Carloi mesaj akisi icinde de gorunur. Gerekirse ayni konusmadan yeniden odeme baslatabilirsiniz.
        </p>
      </div>
    </section>
  );
}
