/**
 * pages/AuthPages.jsx
 *
 * Login and Register pages.
 * Separated into two named exports for clean routing.
 */

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useStore from '@/store/index.js'
import Button from '@/components/ui/Button.jsx'
import { Input, Alert, Card, CardBody } from '@/components/ui/index.jsx'

// ─── Shared auth form wrapper ─────────────────────────────────────────────────

function AuthWrapper({ title, subtitle, children }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="font-display text-3xl font-bold text-night tracking-wide">{title}</h1>
          <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
        </div>

        <Card>
          <CardBody className="p-8">
            {children}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = useStore(s => s.login)
  const navigate = useNavigate()
  const location = useLocation()

  // After login, go back to the page they tried to visit (or /dashboard)
  const intended = location.state?.from?.pathname || '/dashboard'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) return

    setLoading(true)
    setError('')

    try {
      await login(username.trim(), password)
      navigate(intended, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthWrapper
      title="ENTRAR"
      subtitle="Accede a tu cuenta para gestionar tus predicciones"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Usuario"
          name="username"
          type="text"
          placeholder="tu_usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
        />
        <Input
          label="Contraseña"
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && <Alert variant="error">{error}</Alert>}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Entrar
        </Button>

        {/* Demo hint */}
        <div className="bg-gold/10 rounded-xl p-3 text-xs text-gold-dark space-y-1">
          <p className="font-semibold">Accesos de prueba:</p>
          <p>Admin: <code className="bg-white/60 px-1 rounded">admin</code> / <code className="bg-white/60 px-1 rounded">admin123</code></p>
          <p>Participante: <code className="bg-white/60 px-1 rounded">carlos</code> / <code className="bg-white/60 px-1 rounded">pass123</code></p>
        </div>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/register" className="text-gold font-medium hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </AuthWrapper>
  )
}

// ─── Register Page ────────────────────────────────────────────────────────────

export function RegisterPage() {
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const register = useStore(s => s.register)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.displayName || !form.username || !form.password) {
      return setError('Por favor completa todos los campos obligatorios')
    }
    if (form.password !== form.confirmPassword) {
      return setError('Las contraseñas no coinciden')
    }
    if (form.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres')
    }

    setLoading(true)
    try {
      await register({
        displayName: form.displayName.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim(),
        password: form.password,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthWrapper title="¡LISTO!" subtitle="">
        <div className="text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="font-semibold text-night text-lg">Registro exitoso</h2>
          <p className="text-gray-500 text-sm">
            Tu cuenta está pendiente de aprobación por el organizador.
            Te avisarán cuando puedas empezar a predecir.
          </p>
          <Link to="/">
            <Button variant="secondary" className="mt-4">Volver al inicio</Button>
          </Link>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper
      title="UNIRSE"
      subtitle="Crea tu cuenta y empieza a predecir"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre para mostrar *"
          name="displayName"
          placeholder="Carlos Pérez"
          value={form.displayName}
          onChange={handleChange}
          autoFocus
        />
        <Input
          label="Nombre de usuario *"
          name="username"
          placeholder="carlos_perez"
          value={form.username}
          onChange={handleChange}
          hint="Solo letras, números y guion bajo"
        />
        <Input
          label="Email (opcional)"
          name="email"
          type="email"
          placeholder="carlos@email.com"
          value={form.email}
          onChange={handleChange}
        />
        <Input
          label="Contraseña *"
          name="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={form.password}
          onChange={handleChange}
        />
        <Input
          label="Confirmar contraseña *"
          name="confirmPassword"
          type="password"
          placeholder="Repite tu contraseña"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        {error && <Alert variant="error">{error}</Alert>}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Crear cuenta
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-gold font-medium hover:underline">
          Entra aquí
        </Link>
      </p>
    </AuthWrapper>
  )
}
