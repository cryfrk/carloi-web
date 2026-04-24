'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { requestAdminProxy } from '@/lib/client-api';

interface AdminConversationMessage {
  id: string;
  senderName: string;
  senderHandle: string;
  createdAt: string;
  text?: string | null;
}

interface AdminConversationRow {
  id: string;
  type: string;
  name: string;
  handle: string;
  contextPostId?: string | null;
  listingTitle?: string | null;
  participantCount: number;
  messageCount: number;
  lastMessageAt: string;
  participants: Array<{ id: string; name: string; handle: string }>;
  messages?: AdminConversationMessage[];
}

interface MessagesResponse {
  success: true;
  viewer: {
    roleKeys: string[];
    canViewContent: boolean;
    canExportEvidence: boolean;
  };
  conversations: AdminConversationRow[];
}

export default function AdminMessagesPage() {
  const [data, setData] = useState<MessagesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [includeContent, setIncludeContent] = useState(false);
  const [pendingExportId, setPendingExportId] = useState<string | null>(null);

  const loadMessages = async (withContent: boolean) => {
    setLoading(true);
    try {
      const endpoint = withContent ? '/messages/content' : '/messages';
      const response = await requestAdminProxy<MessagesResponse>(endpoint);
      setData(response);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mesaj kayitlari yuklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages(includeContent);
  }, [includeContent]);

  const metrics = useMemo(() => {
    const rows = data?.conversations || [];
    return [
      {
        label: 'Conversation count',
        value: String(rows.length || '...'),
        helper: 'Admin messages ekranina baglanan toplam conversation.',
      },
      {
        label: 'Viewer mode',
        value: data?.viewer.canViewContent ? 'content + metadata' : 'metadata only',
        helper: 'Rol bazli erisim seviyesi.',
      },
      {
        label: 'Evidence export',
        value: data?.viewer.canExportEvidence ? 'aktif' : 'kapali',
        helper: 'Legal export butonunun gorunurlugu.',
      },
    ];
  }, [data]);

  const exportConversation = async (conversationId: string) => {
    const reason = window.prompt('Legal export gerekcesi', 'Hukuki delil talebi') || '';
    if (!reason.trim()) {
      window.alert('Export islemi icin gerekce zorunludur.');
      return;
    }

    const confirmed = window.confirm(
      'Bu conversation icin hukuki delil export islemini baslatmak istediginizden emin misiniz?',
    );

    if (!confirmed) {
      return;
    }

    setPendingExportId(conversationId);
    try {
      const response = await requestAdminProxy<{ success: true; bundle: unknown }>('/messages/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          reason,
        }),
      });

      const blob = new Blob([JSON.stringify(response.bundle, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `carloi-message-evidence-${conversationId}.json`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'Evidence export tamamlanamadi.');
    } finally {
      setPendingExportId(null);
    }
  };

  return (
    <AdminPageTemplate
      eyebrow="Messages"
      title="Messaging evidence and retention"
      description="Support admin metadata gorur; legal export ve super admin gerekirse icerik ve delil export akisina erisebilir."
      metrics={metrics}
    >
      <section className="soft-card admin-panel-card">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="button button-secondary"
            disabled={!data?.viewer.canViewContent}
            onClick={() => setIncludeContent((current) => !current)}
            type="button"
          >
            {includeContent ? 'Metadata moduna don' : 'Icerigi goster'}
          </button>
          <button className="button button-secondary" onClick={() => void loadMessages(includeContent)} type="button">
            Yenile
          </button>
          <p className="muted" style={{ margin: 0 }}>
            {data?.viewer.canViewContent
              ? 'Bu rolde mesaj icerigi gorulebilir. Tum hassas goruntulemeler audit loga yazilir.'
              : 'Bu rolde yalnizca metadata gorunur. Mesaj icerigi kapali tutulur.'}
          </p>
        </div>
      </section>

      <section className="soft-card admin-panel-card">
        {error ? <p style={{ color: '#b91c1c', marginTop: 0 }}>{error}</p> : null}
        {loading ? <p className="muted">Mesaj kayitlari yukleniyor...</p> : null}
        {!error && data?.conversations.length === 0 ? (
          <p className="muted">Gosterilecek conversation kaydi bulunmuyor.</p>
        ) : null}
        <div style={{ display: 'grid', gap: 12 }}>
          {data?.conversations.map((conversation) => (
            <article key={conversation.id} className="support-card">
              <div className="eyebrow">
                {conversation.type} - {conversation.lastMessageAt}
              </div>
              <strong style={{ display: 'block', marginTop: 8 }}>{conversation.name}</strong>
              <div className="muted" style={{ marginTop: 8 }}>
                {conversation.listingTitle ? `${conversation.listingTitle} - ` : ''}
                participants: {conversation.participantCount} - messages: {conversation.messageCount}
              </div>
              <div className="muted" style={{ marginTop: 8 }}>
                {conversation.participants.map((participant) => participant.handle).join(', ')}
              </div>

              {conversation.messages?.length ? (
                <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                  {conversation.messages.slice(-8).map((message) => (
                    <div key={message.id} className="metric-card">
                      <strong>
                        {message.senderName} <span className="muted">{message.senderHandle}</span>
                      </strong>
                      <div className="muted" style={{ marginTop: 6 }}>
                        {message.createdAt}
                      </div>
                      <div style={{ marginTop: 8 }}>{message.text || 'Icerik gizli veya silinmis.'}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {data.viewer.canExportEvidence ? (
                <div style={{ marginTop: 12 }}>
                  <button
                    className="button button-secondary"
                    disabled={pendingExportId === conversation.id}
                    onClick={() => void exportConversation(conversation.id)}
                    type="button"
                  >
                    {pendingExportId === conversation.id ? 'Export hazirlaniyor...' : 'Evidence export'}
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </AdminPageTemplate>
  );
}
