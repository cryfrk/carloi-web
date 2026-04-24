import Image from 'next/image';

import styles from '@/components/payment/payment-page.module.css';

interface PaymentHeaderProps {
  appName: string;
  providerName: string;
}

export function PaymentHeader({ appName, providerName }: PaymentHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerGlow} aria-hidden="true" />
      <div className={styles.headerRow}>
        <div className={styles.brandRow}>
          <div className={styles.logoWrap}>
            <Image alt={appName} height={60} src="/carloi.png" width={60} />
          </div>
          <div className={styles.brandMeta}>
            <span className={styles.securePill}>
              <span className={styles.secureDot} aria-hidden="true" />
              Secure payment page
            </span>
            <h1 className={styles.title}>Sigorta Odeme Adimi</h1>
          </div>
        </div>

        <p className={styles.subtitle}>
          Odemeniz, bankanin guvenli altyapisinda tamamlanir. Kart bilgileriniz uygulamada tutulmaz ve islem
          tamamlandiginda Carloi&apos;ye geri donersiniz.
        </p>

        <span className={styles.providerBadge}>
          <span className={styles.providerAccent} aria-hidden="true" />
          {providerName}
        </span>
      </div>
    </header>
  );
}
