/**
 * MessagesSection.jsx
 *
 * Public wall of messages for Maximiliano. Logged-in users can save one
 * message, which is persisted through the app storage layer.
 */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useStore from '@/store/index.js'
import Button from '@/components/ui/Button.jsx'
import Avatar from '@/components/ui/Avatar.jsx'

function formatMessageDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function MessageCard({ message, index }) {
  const delay = `${Math.min(index, 8) * 0.05}s`

  return (
    <article
      className="bg-white rounded-card border border-gold/10 p-5 shadow-card card-hover animate-slide-up"
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-lg flex-shrink-0">
          <Avatar
            avatar={message.avatar}
            label={message.author}
            className="text-lg leading-none"
            imageClassName="h-10 w-10"
            fallback="💌"
          />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-navy text-sm truncate">{message.author}</p>
          <p className="text-xs text-gray-400">{formatMessageDate(message.createdAt)}</p>
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed italic">
        "{message.text}"
      </p>
    </article>
  )
}

function AddMessageForm({ currentUser, existingMessage, onSave }) {
  const [text, setText] = useState(existingMessage?.text || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const maxChars = 240

  useEffect(() => {
    setText(existingMessage?.text || '')
    setSaved(false)
    setError('')
  }, [existingMessage?.text])

  async function handleSubmit() {
    const trimmed = text.trim()
    if (trimmed.length < 5) return

    setSaving(true)
    setError('')
    try {
      await onSave(trimmed)
      setSaved(true)
    } catch (err) {
      setError(err.message || 'No se pudo guardar el mensaje')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-surface-soft rounded-xl2 border border-gold/15 p-5 sm:p-6 shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-lg">
          <Avatar
            avatar={currentUser.avatar}
            label={currentUser.displayName}
            className="text-lg leading-none"
            imageClassName="h-10 w-10"
          />
        </div>
        <div>
          <p className="font-medium text-navy text-sm">
            {currentUser.displayName}, deja tu mensaje para Maxi
          </p>
          <p className="text-xs text-gray-400">
            {existingMessage ? 'Puedes actualizarlo cuando quieras.' : 'Quedará guardado con tu nombre.'}
          </p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={event => {
          setText(event.target.value.slice(0, maxChars))
          setSaved(false)
        }}
        placeholder="Escribe un deseo, consejo o mensaje para Maximiliano..."
        rows={4}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                   text-navy placeholder-gray-400 resize-none
                   focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        <span className="text-xs text-gray-400">{text.length}/{maxChars}</span>
        <Button size="sm" onClick={handleSubmit} loading={saving} disabled={text.trim().length < 5}>
          {existingMessage ? 'Actualizar mensaje' : 'Enviar mensaje'}
        </Button>
      </div>

      {saved && (
        <p className="mt-3 text-sm text-gold-dark font-medium">
          Tu mensaje para Maximiliano quedó guardado.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-live font-medium">{error}</p>}
    </div>
  )
}

export default function MessagesSection() {
  const { currentUser, maxiMessages, saveMaxiMessage } = useStore()
  const sortedMessages = useMemo(
    () => [...maxiMessages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [maxiMessages]
  )
  const existingMessage = currentUser
    ? sortedMessages.find(message => message.userId === currentUser.id)
    : null

  return (
    <section className="animate-fade-in">
      <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-6 lg:gap-8 items-start mb-10">
        <div>
          <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-2">
            Para la futura leyenda
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-navy tracking-wide leading-tight">
            MENSAJES A MAXI
          </h1>
          <p className="text-gray-500 text-sm mt-4 leading-relaxed max-w-lg">
            Una recopilación de deseos, consejos y cariño para Maximiliano,
            guardada con el autor de cada mensaje.
          </p>
        </div>

        {currentUser ? (
          <AddMessageForm
            currentUser={currentUser}
            existingMessage={existingMessage}
            onSave={saveMaxiMessage}
          />
        ) : (
          <div className="bg-white rounded-card border border-gray-100 p-6 shadow-card">
            <h2 className="font-display text-xl font-bold text-navy tracking-wide mb-2">
              Escribe para Maximiliano
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Inicia sesión o crea tu cuenta para dejar un mensaje con tu nombre.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="sm">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="secondary">Registrarme</Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-1">
            Recopilación
          </p>
          <h2 className="font-display text-2xl font-bold text-navy tracking-wide">
            TODOS LOS MENSAJES
          </h2>
        </div>
        <span className="text-xs text-gray-400">
          {sortedMessages.length} {sortedMessages.length === 1 ? 'mensaje' : 'mensajes'}
        </span>
      </div>

      {sortedMessages.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMessages.map((message, index) => (
            <MessageCard key={message.id} message={message} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 bg-white rounded-card border border-gray-100">
          <div className="text-5xl mb-3">💌</div>
          <p className="text-sm">Sé el primero en dejar un mensaje para Maxi.</p>
        </div>
      )}
    </section>
  )
}
