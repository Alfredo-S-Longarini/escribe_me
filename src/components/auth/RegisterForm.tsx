import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

const schema = z
  .object({
    username: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .max(20, 'Máximo 20 caracteres')
      .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo'),
    email: z
      .string()
      .min(1, 'El correo es requerido')
      .email('Formato de correo inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmá tu contraseña'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken'

export default function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  // ── Username availability check (on blur) ─────────────
  const checkUsername = useCallback(async () => {
    const username = getValues('username')
    if (!username || username.length < 3) return

    setUsernameStatus('checking')

    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    setUsernameStatus(data ? 'taken' : 'available')
  }, [getValues])

  // ── Submit ────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    if (usernameStatus === 'taken') return

    setLoading(true)
    setServerError(null)

    // 1. Double-check username right before signing up (race condition safety)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', data.username)
      .maybeSingle()

    if (existingProfile) {
      setServerError('Ese nombre de usuario ya está en uso.')
      setUsernameStatus('taken')
      setLoading(false)
      return
    }

    // 2. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { username: data.username } },
    })

    if (authError) {
      setServerError(
        authError.message.includes('already registered')
          ? 'Este correo ya tiene una cuenta.'
          : 'Algo salió mal. Intentá de nuevo.'
      )
      setLoading(false)
      return
    }

    if (!authData.user) {
      setServerError('No se pudo crear la cuenta. Intentá de nuevo.')
      setLoading(false)
      return
    }

    // 3. Create profile — if it fails, clean up the auth session
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username: data.username,
      preferences: {
        particles: true,
        particleMode: 'fireflies',
        theme: 'dark',
      },
    })

    if (profileError) {
      await supabase.auth.signOut()
      setServerError(
        profileError.message.includes('unique')
          ? 'Ese nombre de usuario ya está en uso.'
          : 'No se pudo crear el perfil. Intentá de nuevo.'
      )
      setLoading(false)
      return
    }

    window.location.href = '/app'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div style={cardStyle}>
        <h2 style={titleStyle}>Crear tu espacio</h2>
        <p style={subtitleStyle}>Las palabras te esperan adentro.</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
        >
          {/* Username */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.45rem' }}>
              <label style={labelStyle}>Nombre de usuario</label>
              <UsernameIndicator status={usernameStatus} />
            </div>
            <input
              {...register('username')}
              type="text"
              autoComplete="username"
              placeholder="escritora_nocturna"
              style={{
                ...inputStyle,
                borderColor:
                  usernameStatus === 'taken'
                    ? '#c0604a'
                    : usernameStatus === 'available'
                    ? '#6a9e6a'
                    : '#2a2015',
              }}
              onBlur={checkUsername}
            />
            {errors.username && <p style={errorStyle}>{errors.username.message}</p>}
            {usernameStatus === 'taken' && !errors.username && (
              <p style={errorStyle}>Este nombre de usuario ya está en uso.</p>
            )}
          </div>

          <Field label="Correo" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              style={inputStyle}
            />
          </Field>

          <Field label="Contraseña" error={errors.password?.message}>
            <input
              {...register('password')}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              style={inputStyle}
            />
          </Field>

          <Field label="Confirmar contraseña" error={errors.confirmPassword?.message}>
            <input
              {...register('confirmPassword')}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              style={inputStyle}
            />
          </Field>

          {serverError && (
            <p style={{ fontFamily: 'DM Sans, system-ui', fontSize: '0.75rem', color: '#e8735a', textAlign: 'center' }}>
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || usernameStatus === 'taken'}
            style={{
              ...submitStyle,
              background: loading || usernameStatus === 'taken' ? '#8a7560' : '#c9a96e',
              cursor: loading || usernameStatus === 'taken' ? 'not-allowed' : 'pointer',
              marginTop: '0.25rem',
            }}
          >
            {loading ? 'Creando tu espacio...' : 'Comenzar a escribir'}
          </button>
        </form>

        <p style={footerLinkStyle}>
          ¿Ya tenés cuenta?{' '}
          <a href="/auth/login" style={{ color: '#c9a96e', textDecoration: 'none' }}>
            Iniciar sesión
          </a>
        </p>
      </div>
    </motion.div>
  )
}

function UsernameIndicator({ status }: { status: UsernameStatus }) {
  if (status === 'idle') return null
  const map = {
    idle:      { text: '',               color: '' },
    checking:  { text: 'Verificando...', color: 'var(--text-faint)' },
    available: { text: '✓ Disponible',   color: '#6a9e6a' },
    taken:     { text: '✗ No disponible',color: '#c0604a' },
  }
  const { text, color } = map[status]
  return <span style={{ fontFamily: 'DM Sans, system-ui', fontSize: '0.65rem', color }}>{text}</span>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  )
}

const cardStyle: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '2.5rem' }
const titleStyle: React.CSSProperties = { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.75rem', fontWeight: 300, color: 'var(--text)', textAlign: 'center', margin: '0 0 0.375rem' }
const subtitleStyle: React.CSSProperties = { fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center', fontStyle: 'italic', margin: '0 0 1.75rem' }
const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: '0.65rem', color: 'var(--text-faint)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.45rem' }
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.625rem', padding: '0.75rem 1rem', fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: '0.875rem', color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }
const errorStyle: React.CSSProperties = { fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: '0.7rem', color: '#e8735a', marginTop: '0.35rem' }
const submitStyle: React.CSSProperties = { width: '100%', color: 'var(--bg)', border: 'none', borderRadius: '0.625rem', padding: '0.875rem', fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'background 0.2s' }
const footerLinkStyle: React.CSSProperties = { textAlign: 'center', fontFamily: 'DM Sans, system-ui', fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: '1.5rem' }
