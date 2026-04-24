'use client';

import { useMemo, useState } from 'react';

import { SecurePaymentTransitionPanel } from '@/components/payment/secure-payment-transition-panel';
import { buildMessageAttachments, useSession } from '@/providers/session-provider';
import type { ExternalPaymentSession } from '@/lib/types';

export default function MessagesPage() {
  const { snapshot, runSnapshotAction, uploadMedia } = useSession();
  const [selectedId, setSelectedId] = useState<string>('');
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupHandles, setGroupHandles] = useState('');
  const [paymentSession, setPaymentSession] = useState<ExternalPaymentSession | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentLoadingConversationId, setPaymentLoadingConversationId] = useState('');

  if (!snapshot) return null;

  const conversations = snapshot.conversations;
  const activeConversation = conversations.find((item) => item.id === selectedId) || conversations[0];

  async function handleOpenInsurancePayment(conversationId: string) {
    try {
      setPaymentLoadingConversationId(conversationId);
      setPaymentError('');

      const response = await runSnapshotAction('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flow: 'insurance',
          conversationId,
        }),
      });

      const payment =
        response.payment ||
        (response.data && typeof response.data === 'object'
          ? (response.data as ExternalPaymentSession)
          : null);

      if (!payment?.paymentUrl) {
        throw new Error('Guvenli odeme baglantisi olusturulamadi.');
      }

      setPaymentSession(payment);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Sigorta odeme adimi acilamadi.');
    } finally {
      setPaymentLoadingConversationId('');
    }
  }

  async function handleSend() {
    if (!activeConversation) return;
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const kind: 'image' | 'video' | 'audio' = file.type.startsWith('video/')
          ? 'video'
          : file.type.startsWith('audio/')
            ? 'audio'
            : 'image';
        const url = await uploadMedia(file, kind);
        return {
          kind,
          url,
          name: file.name,
          mimeType: file.type,
        };
      }),
    );

    await runSnapshotAction(`/api/conversations/${activeConversation.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: draft,
        attachments: buildMessageAttachments(uploaded),
      }),
    });

    setDraft('');
    setFiles([]);
  }

  return (
    <>
      <section className="glass-card page-header">
        <div>
          <div className="eyebrow">Mesajlasma</div>
          <h1 style={{ margin: '8px 0 6px' }}>Desktop odakli konusma yuzeyi</h1>
          <p className="muted" style={{ margin: 0 }}>
            Ayni backend, ayni konusmalar. Dogrudan mesaj, grup ve ilan pazarligi tek ekranda.
          </p>
        </div>
      </section>

      <section className="glass-card split-layout">
        <div className="list-column stack">
          <div className="soft-card" style={{ padding: 16 }}>
            <strong>Yeni grup olustur</strong>
            <div className="stack" style={{ marginTop: 12 }}>
              <input
                className="input"
                placeholder="Grup adi"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <input
                className="input"
                placeholder="@kullanici1,@kullanici2"
                value={groupHandles}
                onChange={(e) => setGroupHandles(e.target.value)}
              />
              <button
                className="button button-secondary"
                onClick={() =>
                  runSnapshotAction('/api/conversations/group', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: groupName,
                      handles: groupHandles
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                    }),
                  })
                }
              >
                Grup kur
              </button>
            </div>
          </div>

          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedId(conversation.id);
                setPaymentError('');
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <strong>{conversation.name}</strong>
                <span className="muted">{conversation.lastSeen}</span>
              </div>
              <div className="muted" style={{ marginTop: 8 }}>
                {conversation.lastMessage}
              </div>
            </button>
          ))}
        </div>

        <div className="detail-column stack">
          {activeConversation ? (
            <>
              <div className="soft-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                  <div>
                    <div className="eyebrow">
                      {activeConversation.type === 'listing' ? 'Ilan Sohbeti' : 'Konusma'}
                    </div>
                    <h2 style={{ margin: '8px 0 6px' }}>{activeConversation.name}</h2>
                  </div>
                  {activeConversation.type === 'listing' && activeConversation.listingContext ? (
                    <div className="tag">{activeConversation.listingContext.price}</div>
                  ) : null}
                </div>

                {activeConversation.type === 'listing' && activeConversation.listingContext ? (
                  <div className="metrics-grid" style={{ marginTop: 14 }}>
                    <div className="metric-card">
                      <div className="muted">Arac</div>
                      <strong>{activeConversation.listingContext.title}</strong>
                    </div>
                    <div className="metric-card">
                      <div className="muted">Konum</div>
                      <strong>{activeConversation.listingContext.location}</strong>
                    </div>
                    <div className="metric-card">
                      <div className="muted">Anlasma</div>
                      <strong>
                        {activeConversation.agreement?.myAgreed ? 'Sen onayladin' : 'Onayin bekleniyor'}
                      </strong>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="message-thread">
                {activeConversation.messages.map((message) => (
                  <div key={message.id} className={`message-bubble ${message.isMine ? 'mine' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                      <strong>{message.senderName}</strong>
                      <span style={{ opacity: 0.72 }}>{message.time}</span>
                    </div>
                    <div>{message.isDeletedForEveryone ? 'Bu mesaj silindi.' : message.text || 'Ekli medya'}</div>
                    {message.attachments?.length ? (
                      <div className="post-actions" style={{ marginTop: 12 }}>
                        {message.attachments.map((attachment) => (
                          <a key={attachment.id} className="tag" href={attachment.uri} target="_blank" rel="noreferrer">
                            {attachment.kind}: {attachment.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                    {message.isMine && !message.isDeletedForEveryone ? (
                      <div className="post-actions" style={{ marginTop: 12 }}>
                        {message.canEdit ? (
                          <button
                            className="button button-ghost"
                            onClick={async () => {
                              const nextText = window.prompt('Mesaji duzenle', message.text);
                              if (!nextText) return;
                              await runSnapshotAction(
                                `/api/conversations/${activeConversation.id}/messages/${message.id}`,
                                {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ text: nextText }),
                                },
                              );
                            }}
                          >
                            Duzenle
                          </button>
                        ) : null}
                        <button
                          className="button button-ghost"
                          onClick={() =>
                            runSnapshotAction(
                              `/api/conversations/${activeConversation.id}/messages/${message.id}/delete`,
                              {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ scope: 'self' }),
                              },
                            )
                          }
                        >
                          Benden sil
                        </button>
                        {message.canDeleteForEveryone ? (
                          <button
                            className="button button-ghost"
                            onClick={() =>
                              runSnapshotAction(
                                `/api/conversations/${activeConversation.id}/messages/${message.id}/delete`,
                                {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ scope: 'everyone' }),
                                },
                              )
                            }
                          >
                            Herkesten sil
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {activeConversation.type === 'listing' ? (
                <>
                  <div className="post-actions">
                    <button
                      className="button button-secondary"
                      onClick={() => runSnapshotAction(`/api/conversations/${activeConversation.id}/agreement`, { method: 'POST' })}
                    >
                      Anlastik
                    </button>
                    <button
                      className="button button-secondary"
                      onClick={() => runSnapshotAction(`/api/conversations/${activeConversation.id}/registration/share`, { method: 'POST' })}
                    >
                      Ruhsati gonder
                    </button>
                    <button
                      className="button button-secondary"
                      disabled={paymentLoadingConversationId === activeConversation.id}
                      onClick={() => handleOpenInsurancePayment(activeConversation.id)}
                    >
                      {paymentLoadingConversationId === activeConversation.id ? 'Odeme hazirlaniyor...' : 'Sigorta kes'}
                    </button>
                  </div>

                  {paymentError ? (
                    <div className="soft-card" style={{ padding: 16, color: '#b91c1c' }}>
                      {paymentError}
                    </div>
                  ) : null}
                </>
              ) : null}

              <div className="soft-card" style={{ padding: 18, display: 'grid', gap: 12 }}>
                <textarea
                  className="textarea"
                  placeholder="Mesaj yaz"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
                <button className="button button-primary" onClick={handleSend}>
                  Mesaji gonder
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state soft-card">Henuz bir konusma yok.</div>
          )}
        </div>
      </section>

      {paymentSession ? (
        <SecurePaymentTransitionPanel
          payment={paymentSession}
          onCancel={() => setPaymentSession(null)}
          onContinue={() => {
            if (!paymentSession.paymentUrl) {
              return;
            }

            window.location.assign(paymentSession.paymentUrl);
          }}
        />
      ) : null}
    </>
  );
}
