'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { AdminPageTemplate } from '@/components/admin/admin-page';
import { requestAdminProxy } from '@/lib/client-api';

interface AdminUserRow {
  id: string;
  name: string;
  handle: string;
  verified: boolean;
  accountType: string;
  commercialStatus: string;
  riskLevel: string;
  yearlyVehicleListingCount: number;
  yearlyVehicleSaleCount: number;
  commercialBehaviorFlag: boolean;
  subscriptionStatus: string;
  fraudFlagCount: number;
}

interface UserFilters {
  q: string;
  accountType: string;
  commercialStatus: string;
  riskLevel: string;
  commercialBehaviorOnly: boolean;
}

const defaultFilters: UserFilters = {
  q: '',
  accountType: '',
  commercialStatus: '',
  riskLevel: '',
  commercialBehaviorOnly: false,
};

function buildUsersQuery(filters: UserFilters) {
  const params = new URLSearchParams();

  if (filters.q.trim()) {
    params.set('q', filters.q.trim());
  }
  if (filters.accountType) {
    params.set('accountType', filters.accountType);
  }
  if (filters.commercialStatus) {
    params.set('commercialStatus', filters.commercialStatus);
  }
  if (filters.riskLevel) {
    params.set('riskLevel', filters.riskLevel);
  }
  if (filters.commercialBehaviorOnly) {
    params.set('commercialBehaviorOnly', 'true');
  }

  const query = params.toString();
  return query ? `/users?${query}` : '/users';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<UserFilters>(defaultFilters);

  const loadUsers = async (activeFilters: UserFilters) => {
    setLoading(true);
    try {
      const response = await requestAdminProxy<{ success: true; users: AdminUserRow[] }>(
        buildUsersQuery(activeFilters),
      );
      setUsers(response.users || []);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Kullanici listesi yuklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers(appliedFilters);
  }, [appliedFilters]);

  const metrics = useMemo(() => {
    return [
      {
        label: 'Toplam kullanici',
        value: loading ? '...' : String(users.length),
        helper: 'Aktif filtrelerle donen canli kullanici sayisi.',
      },
      {
        label: 'Commercial hesap',
        value: loading ? '...' : String(users.filter((item) => item.accountType === 'commercial').length),
        helper: 'Ticari akisa gecmis hesaplar.',
      },
      {
        label: 'Yuksek risk',
        value: loading ? '...' : String(users.filter((item) => item.riskLevel === 'high').length),
        helper: 'Ek inceleme gerektirebilecek hesaplar.',
      },
      {
        label: 'Behavior flag',
        value: loading ? '...' : String(users.filter((item) => item.commercialBehaviorFlag).length),
        helper: 'Soft commercial prompt gerektiren hesaplar.',
      },
    ];
  }, [loading, users]);

  return (
    <AdminPageTemplate
      eyebrow="Users"
      title="User operations"
      description="Kullanici listesi, hesap tipi, ticari durum, risk seviyesi ve yillik listing/sale sayaçlari canli backend verisiyle izlenir."
      metrics={metrics}
    >
      <section className="soft-card admin-panel-card">
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            alignItems: 'end',
          }}
        >
          <label>
            <div className="muted" style={{ marginBottom: 6 }}>
              Arama
            </div>
            <input
              className="input"
              placeholder="Ad veya handle"
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            />
          </label>

          <label>
            <div className="muted" style={{ marginBottom: 6 }}>
              Hesap tipi
            </div>
            <select
              className="select"
              value={filters.accountType}
              onChange={(event) =>
                setFilters((current) => ({ ...current, accountType: event.target.value }))
              }
            >
              <option value="">Tum hesaplar</option>
              <option value="individual">individual</option>
              <option value="commercial">commercial</option>
            </select>
          </label>

          <label>
            <div className="muted" style={{ marginBottom: 6 }}>
              Commercial status
            </div>
            <select
              className="select"
              value={filters.commercialStatus}
              onChange={(event) =>
                setFilters((current) => ({ ...current, commercialStatus: event.target.value }))
              }
            >
              <option value="">Tum durumlar</option>
              <option value="not_applied">not_applied</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="suspended">suspended</option>
              <option value="revoked">revoked</option>
            </select>
          </label>

          <label>
            <div className="muted" style={{ marginBottom: 6 }}>
              Risk seviyesi
            </div>
            <select
              className="select"
              value={filters.riskLevel}
              onChange={(event) => setFilters((current) => ({ ...current, riskLevel: event.target.value }))}
            >
              <option value="">Tum seviyeler</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </label>

          <label style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 46 }}>
            <input
              type="checkbox"
              checked={filters.commercialBehaviorOnly}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  commercialBehaviorOnly: event.target.checked,
                }))
              }
            />
            <span className="muted">Sadece behavior flag</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
          <button className="button button-primary" onClick={() => setAppliedFilters({ ...filters })} type="button">
            Filtreleri uygula
          </button>
          <button
            className="button button-secondary"
            onClick={() => {
              setFilters(defaultFilters);
              setAppliedFilters(defaultFilters);
            }}
            type="button"
          >
            Sifirla
          </button>
          <button className="button button-secondary" onClick={() => void loadUsers(appliedFilters)} type="button">
            Yenile
          </button>
        </div>
      </section>

      <section className="soft-card admin-panel-card">
        {error ? <p style={{ color: '#b91c1c', marginTop: 0 }}>{error}</p> : null}
        {loading ? <p className="muted">Kullanici listesi yukleniyor...</p> : null}
        {!loading && !error && users.length === 0 ? (
          <p className="muted">Secili filtrelerle eslesen kullanici kaydi bulunmuyor.</p>
        ) : null}

        {!loading && !error && users.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Kullanici', 'Hesap tipi', 'Commercial', 'Risk', 'Yillik ilan', 'Yillik satis', 'Detay'].map(
                    (header) => (
                      <th
                        key={header}
                        style={{
                          textAlign: 'left',
                          padding: '12px 10px',
                          borderBottom: '1px solid rgba(148,163,184,0.2)',
                        }}
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ padding: '12px 10px' }}>
                      <strong>{user.name}</strong>
                      <div className="muted">{user.handle}</div>
                      <div className="muted" style={{ marginTop: 4 }}>
                        {user.verified ? 'Verified' : 'Email pending'} - {user.subscriptionStatus}
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px' }}>{user.accountType}</td>
                    <td style={{ padding: '12px 10px' }}>
                      {user.commercialStatus}
                      {user.commercialBehaviorFlag ? (
                        <div className="muted" style={{ marginTop: 4 }}>
                          behavior flag aktif
                        </div>
                      ) : null}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {user.riskLevel}
                      <div className="muted" style={{ marginTop: 4 }}>
                        fraud: {user.fraudFlagCount}
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px' }}>{user.yearlyVehicleListingCount}</td>
                    <td style={{ padding: '12px 10px' }}>{user.yearlyVehicleSaleCount}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <Link href={`/admin/users/${user.id}`} className="button button-secondary">
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
