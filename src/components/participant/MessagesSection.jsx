/**
 * MessagesSection.jsx
 *
 * Participants can leave a message/wish for Maximiliano.
 * Messages are stored in localStorage and displayed as a card wall.
 * Logged-in users can add one message per account.
 */

import { useState, useEffect } from 'react'
import useStore from '@/store/index.js'
import Button from '@/components/ui/Button.jsx'

const MESSAGES_KEY = 'futura_leyenda_messages'

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadMessages() {
  try {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]')
  } catch {
    return []
  }
}

function saveMessages(msgs) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs))
}

// Seed messages so the wall doesn't look empty at first
const SEED_MESSAGES = [
  { id: 's1', author: 'La familia', avatar: '❤️',  text: 'Maximiliano, que este primer Mundial sea el inicio de una vida llena de goles, sueños y amor. ¡Te amamos!', createdAt: '2026-06-01' },
  { id: 's2', author: 'Los padrinos', avatar: '⭐', text: '¡Futura leyenda! Que cada partido sea una aventura y cada día una victoria. Bienvenido al mundo.', createdAt: '2026-06-02' },
  { id: 's3', author: 'Los abuelos',  avatar: '🌟', text: 'Que crezcas tan grande como nuestro amor por ti. El primer Mundial de muchos. ¡Vas a ser el mejor!', createdAt: '2026-06-03' },
]

// ─── Message card ─────────────────────────────────────────────────────────────

function MessageCard({ message, index }) {
  const delay = `${index * 0.08}s`
  return (
    <div
      className="bg-white rounded-card border border-gold/10 p-5 shadow-card card-hover animate-slide-up"
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-lg flex-shrink-0">
          {message.avatar}
        </div>
        <div>
          <p className="font-semibold text-navy text-sm">{message.author}</p>
          <p className="text-xs text-gray-400">{message.createdAt}</p>
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed italic">
        "{message.text}"
      </p>
    </div>
  )
}

// ─── Add message form ─────────────────────────────────────────────────────────

function AddMessageForm({ onAdd, hasMessage }) {
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)
  const maxChars = 200

  function handleSubmit() {
    const trimmed = text.trim()
    if (!trimmed || trimmed.length < 5) return
    onAdd(trimmed)
    setText('')
    setSaved(true)
  }

  if (hasMessage || saved) {
    return (
      <div className="text-center py-4">
        <div className="text-3xl mb-2">✉️</div>
        <p className="text-sm text-gold-dark font-medium">
          Tu mensaje para Maximiliano ya está guardado 💛
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={e => setText(e.target.value.slice(0, maxChars))}
        placeholder="Escribe un deseo, consejo o mensaje para Maximiliano..."
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                   text-navy placeholder-gray-400 resize-none
                   focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{text.length}/{maxChars}</span>
        <Button size="sm" onClick={handleSubmit} disabled={text.trim().length < 5}>
          Enviar mensaje 💌
        </Button>
      </div>
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function MessagesSection() {
  const { currentUser } = useStore()
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const stored = loadMessages()
    // Show seeds only if no real messages yet
    setMessages(stored.length > 0 ? stored : SEED_MESSAGES)
  }, [])

  const userHasMessage = currentUser
    ? messages.some(m => m.userId === currentUser.id)
    : false

  function handleAdd(text) {
    const newMsg = {
      id: `m_${Date.now()}`,
      userId:    currentUser.id,
      author:    currentUser.displayName,
      avatar:    currentUser.avatar || '💌',
      text,
      createdAt: new Date().toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
    const updated = [newMsg, ...messages.filter(m => m.id.startsWith('s') ? true : m.userId !== currentUser.id)]
    setMessages(updated)
    saveMessages(updated.filter(m => !m.id.startsWith('s')))
  }

  return (
    <section className="py-16">
      {/* Section header */}
      <div className="text-center mb-10">
        <p className="font-body text-gold text-xs tracking-[0.3em] uppercase mb-3">
          Para la futura leyenda
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy tracking-wide mb-3">
          MENSAJES PARA MAXIMILIANO
        </h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
          Deja un mensaje, un deseo o un consejo que guardará para siempre.
          Cuando crezca, sabrá cuántas personas lo esperaban.
        </p>
      </div>

      {/* Add message (only for logged-in users) */}
      {currentUser ? (
        <div className="bg-surface-soft rounded-xl2 border border-gold/15 p-6 mb-10 max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{currentUser.avatar}</span>
            <p className="font-medium text-navy text-sm">
              {currentUser.displayName}, ¿qué le dices a Maximiliano?
            </p>
          </div>
          <AddMessageForm onAdd={handleAdd} hasMessage={userHasMessage} />
        </div>
      ) : (
        <div className="text-center mb-10">
          <p className="text-sm text-gray-500 mb-3">
            Inicia sesión para dejar tu mensaje
          </p>
          <a href="#/login">
            <Button variant="outline" size="sm">Entrar para escribir</Button>
          </a>
        </div>
      )}

      {/* Message wall */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {messages.map((msg, i) => (
          <MessageCard key={msg.id} message={msg} index={i} />
        ))}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">✉️</div>
          <p className="text-sm">Sé el primero en dejar un mensaje</p>
        </div>
      )}
    </section>
  )
}
