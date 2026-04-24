'use client';

import { useEffect, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { requestAdminProxy } from '@/lib/client-api';

interface AuditLogRow {
  id: string;
  actor_type: string;
  actor_id?: string | null;
  target_type: string;
  target_id?: string | null;
  action: string;
  metadata?: string | null;
  created_at: string;
}

interface AuditResponse {
  success: true;
  logs: AuditLogRow[];
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    requestAdminProxy<AuditResponse>('/audit')
      .then((response) => {
        if (mounted) {
          setLogs(response.logs);
        }
      })
      .catch((cause) => {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : 'Audit kayitlari yuklenemedi.');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminPageTemplate
      eyebrow="Audit"
      title="Audit logs and evidence history"
      description="Append-only audit kayitlari, rol-temelli gorunurluk ve delil hazirligi icin ana izleme yuzeyi."
      metrics={[
        {
          label: 'Recent logs',
          value: String(logs.length || '...'),
          helper: 'Yuklenen son audit kaydi sayisi.',
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
        <h3 style={{ marginTop: 0 }}>Recent audit activity</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {logs.map((log) => (
            <article key={log.id} className="support-card">
              <div className="eyebrow">
                {log.actor_type} • {log.created_at}
              </div>
              <strong style={{ display: 'block', marginTop: 8 }}>{log.action}</strong>
              <div className="muted" style={{ marginTop: 8 }}>
                {log.target_type}
                {log.target_id ? ` • ${log.target_id}` : ''}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminPageTemplate>
  );
}
