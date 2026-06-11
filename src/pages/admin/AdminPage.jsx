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
import Avatar from '@/components/ui/Avatar.jsx'
import { groupMatchesByDate, formatDateLabel } from '@/utils/date.utils.js'
import { MATCH_SYNC_INTERVAL_MS } from '@/services/matches-api.service.js'
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
  const { matches, adminUpdateMatch, adminSyncMatchesFromApi } = useStore()
  const [saved, setSaved] = useState(false)
  const [savingMatchId, setSavingMatchId] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [autoSync, setAutoSync] = useState(false)
  const [syncSummary, setSyncSummary] = useState(null)
  const [syncError, setSyncError] = useState('')

  const grouped = groupMatchesByDate(matches)
  const dateKeys = Object.keys(grouped).sort()

  function formatSyncTimestamp(value) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  useEffect(() => {
    if (!autoSync) return undefined

    const interval = window.setInterval(() => {
      handleApiSync({ silent: true })
    }, MATCH_SYNC_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [autoSync, matches, syncing])

  async function handleSave(matchId, updates) {
    setSavingMatchId(matchId)
    setSaveError('')
    setSaved(false)

    try {
      await adminUpdateMatch(matchId, updates)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setSaveError(err.message || 'No se pudo guardar el resultado del partido')
    } finally {
      setSavingMatchId(null)
    }
  }

  async function handleApiSync({ silent = false } = {}) {
    if (syncing) return

    setSyncing(true)
    setSyncError('')
    if (!silent) setSyncSummary(null)

    try {
      const result = await adminSyncMatchesFromApi()
      setSyncSummary(result)
    } catch (err) {
      setSyncError(err.message || 'No se pudo sincronizar con la API de partidos')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-gray-500">
          Actualiza resultados y estado de cada partido
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={event => setAutoSync(event.target.checked)}
              className="h-4 w-4 accent-gold"
            />
            Auto cada {Math.round(MATCH_SYNC_INTERVAL_MS / 1000)}s
          </label>
          <Button size="sm" variant="secondary" loading={syncing} onClick={() => handleApiSync()}>
            Sincronizar API
          </Button>
          {saved && (
            <span className="text-xs text-pitch-dark font-medium bg-pitch/10 px-3 py-1.5 rounded-lg">
              ✓ Guardado
            </span>
          )}
          {savingMatchId && (
            <span className="text-xs text-gold-dark font-medium bg-gold/10 px-3 py-1.5 rounded-lg">
              Guardando...
            </span>
          )}
        </div>
      </div>
      {saveError && (
        <Alert variant="error" className="mb-4">
          {saveError}
        </Alert>
      )}
      {syncError && (
        <Alert variant="error" className="mb-4">
          {syncError}
        </Alert>
      )}
      {syncSummary && (
        <Alert variant={syncSummary.updated.length > 0 ? 'success' : 'info'} className="mb-4">
          API revisada: {syncSummary.apiCount} partidos online, {syncSummary.updated.length} cambios aplicados.
          {syncSummary.syncedAt && (
            <span className="block mt-1">
              Última revisión: {formatSyncTimestamp(syncSummary.syncedAt)}
            </span>
          )}
          {syncSummary.updated.length > 0 && (
            <span className="block mt-1">
              {syncSummary.updated.slice(0, 4).map(item => item.changes.join(', ')).join(' · ')}
            </span>
          )}
        </Alert>
      )}

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

function UserRow({ user, currentUserId, busy, onApprove, onToggleBan, onDelete }) {
  const isCurrentUser = user.id === currentUserId
  const canManage = user.role !== 'admin' && !isCurrentUser

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3.5 pl-5 pr-4">
        <div className="flex items-center gap-3">
          <Avatar
            avatar={user.avatar}
            label={user.displayName}
            className="text-xl"
            imageClassName="h-7 w-7"
          />
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
          <Badge variant="red">Pendiente / Inactivo</Badge>
        )}
      </td>
      <td className="py-3.5 pr-5">
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            {!user.approved && (
              <Button
                size="sm"
                variant="primary"
                loading={busy}
                onClick={() => onApprove(user.id)}
              >
                Aprobar
              </Button>
            )}
            <Button
              size="sm"
              variant={user.approved ? 'danger' : 'secondary'}
              loading={busy}
              onClick={() => onToggleBan(user.id, user.approved)}
            >
              {user.approved ? 'Suspender' : 'Reactivar'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => onDelete(user)}
            >
              Eliminar
            </Button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">
            {isCurrentUser ? 'Tu cuenta' : 'Protegido'}
          </span>
        )}
      </td>
    </tr>
  )
}

function UsersTab() {
  const { users, currentUser, adminUpdateUser, adminDeleteUser } = useStore()
  const [busyUserId, setBusyUserId] = useState(null)
  const [savedMessage, setSavedMessage] = useState('')
  const [error, setError] = useState('')

  async function runUserAction(userId, action, successMessage) {
    setBusyUserId(userId)
    setError('')
    setSavedMessage('')

    try {
      await action()
      setSavedMessage(successMessage)
      setTimeout(() => setSavedMessage(''), 2500)
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el usuario')
    } finally {
      setBusyUserId(null)
    }
  }

  function handleApprove(userId) {
    return runUserAction(
      userId,
      () => adminUpdateUser(userId, { approved: true }),
      'Usuario aprobado'
    )
  }

  function handleToggleBan(userId, currentlyApproved) {
    return runUserAction(
      userId,
      () => adminUpdateUser(userId, { approved: !currentlyApproved }),
      currentlyApproved ? 'Usuario suspendido' : 'Usuario reactivado'
    )
  }

  function handleDelete(user) {
    const confirmed = window.confirm(`¿Eliminar definitivamente a ${user.displayName}?`)
    if (!confirmed) return null

    return runUserAction(
      user.id,
      () => adminDeleteUser(user.id),
      'Usuario eliminado'
    )
  }

  const sortedUsers = [...users].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1
    if (a.role !== 'admin' && b.role === 'admin') return 1
    if (a.approved !== b.approved) return a.approved ? 1 : -1
    return a.displayName.localeCompare(b.displayName)
  })
  const pendingCount = users.filter(u => !u.approved && u.role !== 'admin').length

  return (
    <div>
      {pendingCount > 0 && (
        <Alert variant="warning" className="mb-4">
          ⏳ Hay <strong>{pendingCount} cuenta(s)</strong> pendiente(s) de aprobación
        </Alert>
      )}
      {savedMessage && (
        <Alert variant="success" className="mb-4">
          ✓ {savedMessage}
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
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
            {sortedUsers.map(user => (
              <UserRow
                key={user.id}
                user={user}
                currentUserId={currentUser?.id}
                busy={busyUserId === user.id}
                onApprove={handleApprove}
                onToggleBan={handleToggleBan}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
        </div>
      </div>
      {users.length === 0 && (
        <div className="text-center py-10 text-sm text-gray-400">
          No hay usuarios registrados todavía.
        </div>
      )}
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
