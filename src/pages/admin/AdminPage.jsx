/**
 * pages/admin/AdminPages.jsx
 *
 * Admin panel with tabs:
 * - Partidos: enter/update match scores and status
 * - Usuarios: approve, ban, or delete participants
 */

import { useEffect, useState } from 'react'
import useStore from '@/store/index.js'
import MatchCard from '@/components/participant/MatchCard.jsx'
import Button from '@/components/ui/Button.jsx'
import { Spinner, Badge, Alert } from '@/components/ui/index.jsx'
import { groupMatchesByDate, formatDateLabel } from '@/utils/date.utils.js'
import clsx from 'clsx'

// ─── Tab navigation ───────────────────────────────────────────────────────────

function AdminTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'matches', label: '⚽ Partidos' },
    { id: 'users',   label: '👥 Usuarios' },
  ]

  return (
    <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            'px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
            activeTab === tab.id
              ? 'bg-white text-navy shadow-sm'
              : 'text-gray-500 hover:text-navy'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── Matches tab ──────────────────────────────────────────────────────────────

function MatchesTab() {
  const { matches, adminUpdateMatch } = useStore()
  const [saved, setSaved] = useState(false)

  const grouped = groupMatchesByDate(matches)
  const dateKeys = Object.keys(grouped).sort()

  async function handleSave(matchId, updates) {
    await adminUpdateMatch(matchId, updates)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Actualiza resultados y estado de cada partido
        </p>
        {saved && (
          <span className="text-xs text-pitch-dark font-medium bg-pitch/10 px-3 py-1.5 rounded-lg">
            ✓ Guardado
          </span>
        )}
      </div>

      <div className="space-y-8">
        {dateKeys.map(dateKey => (
          <div key={dateKey}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-200 capitalize">
              {formatDateLabel(dateKey)}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[dateKey].map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  mode="admin"
                  onAdminSave={handleSave}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Users tab ────────────────────────────────────────────────────────────────

function UserRow({ user, onApprove, onToggleBan }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3.5 pl-5 pr-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{user.avatar}</span>
          <div>
            <div className="font-medium text-sm text-navy">{user.displayName}</div>
            <div className="text-xs text-gray-400">@{user.username}</div>
          </div>
        </div>
      </td>
      <td className="py-3.5 pr-4 hidden sm:table-cell">
        <span className="text-xs text-gray-500">{user.email || '—'}</span>
      </td>
      <td className="py-3.5 pr-4">
        <Badge variant={user.role === 'admin' ? 'gold' : 'gray'}>
          {user.role === 'admin' ? '⭐ Admin' : 'Participante'}
        </Badge>
      </td>
      <td className="py-3.5 pr-4">
        {user.approved ? (
          <Badge variant="green">Activo</Badge>
        ) : (
          <Badge variant="red">Pendiente</Badge>
        )}
      </td>
      <td className="py-3.5 pr-5">
        {user.role !== 'admin' && (
          <div className="flex gap-2">
            {!user.approved && (
              <Button size="sm" variant="primary" onClick={() => onApprove(user.id)}>
                Aprobar
              </Button>
            )}
            <Button
              size="sm"
              variant={user.approved ? 'danger' : 'secondary'}
              onClick={() => onToggleBan(user.id, user.approved)}
            >
              {user.approved ? 'Suspender' : 'Reactivar'}
            </Button>
          </div>
        )}
      </td>
    </tr>
  )
}

function UsersTab() {
  const { users, adminUpdateUser } = useStore()

  function handleApprove(userId) {
    adminUpdateUser(userId, { approved: true })
  }

  function handleToggleBan(userId, currentlyApproved) {
    adminUpdateUser(userId, { approved: !currentlyApproved })
  }

  const pendingCount = users.filter(u => !u.approved && u.role !== 'admin').length

  return (
    <div>
      {pendingCount > 0 && (
        <Alert variant="warning" className="mb-4">
          ⏳ Hay <strong>{pendingCount} cuenta(s)</strong> pendiente(s) de aprobación
        </Alert>
      )}

      <div className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 pl-5 pr-4 text-left text-xs text-gray-400 uppercase tracking-wider">Usuario</th>
              <th className="py-3 pr-4 text-left text-xs text-gray-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
              <th className="py-3 pr-4 text-left text-xs text-gray-400 uppercase tracking-wider">Rol</th>
              <th className="py-3 pr-4 text-left text-xs text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="py-3 pr-5 text-left text-xs text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <UserRow
                key={user.id}
                user={user}
                onApprove={handleApprove}
                onToggleBan={handleToggleBan}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Admin page shell ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('matches')
  const { loadAll, loading } = useStore()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-navy tracking-wide">
          PANEL DE ADMINISTRACIÓN
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestiona partidos, usuarios y configuración de la polla
        </p>
      </div>

      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'matches' && <MatchesTab />}
      {activeTab === 'users'   && <UsersTab />}
    </div>
  )
}
