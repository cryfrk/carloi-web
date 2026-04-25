'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error) {
      console.error('Carloi web runtime error', {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      });
    }
  }, [error]);

  return (
    <main className="page-shell public-layout">
      <section className="glass-card error-shell">
        <div className="eyebrow">Carloi</div>
        <h1>Bu ekran gecici olarak yuklenemedi.</h1>
        <p className="muted">
          Beklenmeyen bir istemci hatasi algiladik. Verilerinizi koruduk; sayfayi yenileyebilir veya
          ana akis ekranina donebilirsiniz.
        </p>
        <div className="support-card" style={{ textAlign: 'left' }}>
          <strong>Ne yapabilirsiniz?</strong>
          <ul className="admin-bullet-list">
            <li>Sayfayi yeniden deneyin.</li>
            <li>Oturumunuz aciksa akis ekranina donun.</li>
            <li>Sorun surerse destek ekibine ekran adini iletin.</li>
          </ul>
          {error?.message ? <p className="muted" style={{ marginBottom: 0 }}>Durum: {error.message}</p> : null}
        </div>
        <div className="post-actions">
          <button className="button button-primary" onClick={() => reset()} type="button">
            Tekrar dene
          </button>
          <Link className="button button-secondary" href="/feed">
            Akisa don
          </Link>
          <Link className="button button-ghost" href="/login">
            Giris ekranina git
          </Link>
        </div>
      </section>
    </main>
  );
}
