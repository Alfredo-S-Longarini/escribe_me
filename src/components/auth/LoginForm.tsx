import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

const schema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Formato de correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type FormData = z.infer<typeof schema>

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setServerError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError('Correo o contraseña incorrectos.')
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
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '1.25rem',
          padding: '2.5rem',
        }}
      >
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '1.75rem',
            fontWeight: 300,
            color: 'var(--text)',
            textAlign: 'center',
            margin: '0 0 0.375rem',
          }}
        >
          Bienvenida de nuevo
        </h2>
        <p
          style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: '0.8rem',
            color: 'var(--text-faint)',
            textAlign: 'center',
            fontStyle: 'italic',
            margin: '0 0 2rem',
          }}
        >
          Tu refugio te ha echado de menos.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Correo</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              style={inputStyle}
            />
            {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              style={inputStyle}
            />
            {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
          </div>

          {serverError && (
            <p style={{ ...errorStyle, textAlign: 'center', fontSize: '0.8rem' }}>{serverError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'var(--text-ghost)' : '#c9a96e',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: '0.625rem',
              padding: '0.875rem',
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginTop: '0.25rem',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontFamily: 'DM Sans, system-ui', fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: '1.5rem' }}>
          ¿Primera vez?{' '}
          <a href="/auth/register" style={{ color: '#c9a96e', textDecoration: 'none' }}>
            Crear cuenta
          </a>
        </p>
      </div>
    </motion.div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'DM Sans, system-ui, sans-serif',
  fontSize: '0.65rem',
  color: 'var(--text-faint)',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  marginBottom: '0.5rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: '0.625rem',
  padding: '0.75rem 1rem',
  fontFamily: 'DM Sans, system-ui, sans-serif',
  fontSize: '0.875rem',
  color: 'var(--text)',
  outline: 'none',
  transition: 'border-color 0.2s',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'DM Sans, system-ui, sans-serif',
  fontSize: '0.7rem',
  color: '#e8735a',
  marginTop: '0.375rem',
}
