import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../../lib/supabase'
import ThemeToggle from '../shared/ThemeToggle'
import type { Profile } from '../../types'

/* ── Schemas ─────────────────────────────────────────── */
const usernameSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo'),
})

const emailSchema = z.object({
  email: z.string().email('Formato de correo inválido'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Ingresá tu contraseña actual'),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmá la nueva contraseña'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type UsernameData  = z.infer<typeof usernameSchema>
type EmailData     = z.infer<typeof emailSchema>
type PasswordData  = z.infer<typeof passwordSchema>

/* ── Main component ──────────────────────────────────── */
export default function ProfilePage() {
  const [profile, setProfile]           = useState<Profile | null>(null)
  const [loading, setLoading]           = useState(true)
  const [deleteStep, setDeleteStep]     = useState<0 | 1 | 2>(0)
  const [deleteInput, setDeleteInput]   = useState('')

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(data as Profile)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleDeleteAccount = async () => {
    if (deleteStep === 0) { setDeleteStep(1); return }
    if (deleteStep === 1) {
      if (deleteInput !== profile?.username) return
      setDeleteStep(2)
      return
    }
    // Step 2 — final deletion
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.admin?.deleteUser(user.id)
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic', color: 'var(--text-faint)', fontSize: '0.9rem' }}>
        Cargando tu perfil...
      </p>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: '560px', margin: '0 auto', padding: '2.5rem 1.5rem' }}
    >
      <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '2rem', fontWeight: 300, color: 'var(--text)', margin: '0 0 0.375rem' }}>
        Mi perfil
      </h1>
      <p style={{ fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.75rem', color: 'var(--text-faint)', fontStyle: 'italic', margin: '0 0 2.5rem' }}>
        Tu espacio, tus reglas.
      </p>

      {/* Appearance */}
      <Section title="Apariencia">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tema</div>
            <div style={{ fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.65rem', color: 'var(--text-faint)', marginTop: '2px' }}>Modo claro o modo oscuro</div>
          </div>
          <ThemeToggle />
        </div>
      </Section>

      {/* Username */}
      <Section title="Nombre de usuario">
        <UsernameForm profile={profile} onSaved={loadProfile} />
      </Section>

      {/* Email */}
      <Section title="Correo">
        <EmailForm />
      </Section>

      {/* Password */}
      <Section title="Contraseña">
        <PasswordForm />
      </Section>

      {/* Session */}
      <Section title="Sesión">
        <button
          onClick={handleSignOut}
          style={outlineBtn}
        >
          Cerrar sesión
        </button>
      </Section>

      {/* Danger zone */}
      <Section title="Zona de peligro" danger>
        <p style={{ fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.75rem', color: 'var(--text-faint)', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
          Cerrar la cuenta elimina permanentemente todos tus escritos y datos.
        </p>

        {deleteStep === 0 && (
          <button onClick={handleDeleteAccount} style={dangerBtn}>
            Cerrar mi cuenta
          </button>
        )}

        {deleteStep === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.75rem', color: '#c06050', margin: '0 0 0.75rem' }}>
              Escribí tu nombre de usuario para confirmar: <strong>{profile?.username}</strong>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder={profile?.username}
                style={{ ...fieldInput, flex: 1 }}
              />
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== profile?.username}
                style={{ ...dangerBtn, opacity: deleteInput !== profile?.username ? 0.4 : 1 }}
              >
                Confirmar
              </button>
              <button onClick={() => { setDeleteStep(0); setDeleteInput('') }} style={outlineBtn}>
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {deleteStep === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.75rem', color: '#c06050', margin: '0 0 0.75rem' }}>
              ¿Estás completamente segura/o? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleDeleteAccount} style={{ ...dangerBtn, background: '#8a2020' }}>
                Sí, eliminar todo
              </button>
              <button onClick={() => { setDeleteStep(0); setDeleteInput('') }} style={outlineBtn}>
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </Section>
    </motion.div>
  )
}

/* ── Username form ───────────────────────────────────── */
function UsernameForm({ profile, onSaved }: { profile: Profile | null; onSaved: () => void }) {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UsernameData>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: profile?.username ?? '' },
  })

  const onSubmit = async (data: UsernameData) => {
    setServerError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase.from('profiles').select('id').eq('username', data.username).neq('id', user.id).maybeSingle()
    if (existing) { setServerError('Ese nombre ya está en uso.'); return }

    const { error } = await supabase.from('profiles').update({ username: data.username }).eq('id', user.id)
    if (error) { setServerError('No se pudo guardar.'); return }
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2500)
    onSaved()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <input {...register('username')} name="username" autoComplete="username" style={fieldInput} />
          {errors.username && <p style={errStyle}>{errors.username.message}</p>}
          {serverError && <p style={errStyle}>{serverError}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} style={primaryBtn}>
          {success ? '✓' : isSubmitting ? '...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

/* ── Email form ──────────────────────────────────────── */
function EmailForm() {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmailData>({
    resolver: zodResolver(emailSchema),
  })

  const onSubmit = async (data: EmailData) => {
    setServerError(null)
    const { error } = await supabase.auth.updateUser({ email: data.email })
    if (error) { setServerError('No se pudo actualizar el correo.'); return }
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <input {...register('email')} type="email" name="email" autoComplete="email" placeholder="nuevo@correo.com" style={fieldInput} />
          {errors.email && <p style={errStyle}>{errors.email.message}</p>}
          {serverError && <p style={errStyle}>{serverError}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} style={primaryBtn}>
          {success ? '✓ Enviado' : isSubmitting ? '...' : 'Guardar'}
        </button>
      </div>
      {success && <p style={{ fontFamily: 'DM Sans,system-ui', fontSize: '0.7rem', color: '#6a9e6a', marginTop: '0.5rem' }}>
        Te enviamos un correo de confirmación al nuevo email.
      </p>}
    </form>
  )
}

/* ── Password form ───────────────────────────────────── */
function PasswordForm() {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordData) => {
    setServerError(null)
    // Re-authenticate with current password first
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: data.currentPassword,
    })
    if (signInError) { setServerError('La contraseña actual es incorrecta.'); return }

    const { error } = await supabase.auth.updateUser({ password: data.newPassword })
    if (error) { setServerError('No se pudo cambiar la contraseña.'); return }

    setSuccess(true)
    reset()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        <label style={labelStyle}>Contraseña actual</label>
        <input {...register('currentPassword')} type="password" name="current-password" autoComplete="current-password" placeholder="••••••••" style={fieldInput} />
        {errors.currentPassword && <p style={errStyle}>{errors.currentPassword.message}</p>}
      </div>
      <div>
        <label style={labelStyle}>Nueva contraseña</label>
        <input {...register('newPassword')} type="password" name="new-password" autoComplete="new-password" placeholder="••••••••" style={fieldInput} />
        {errors.newPassword && <p style={errStyle}>{errors.newPassword.message}</p>}
      </div>
      <div>
        <label style={labelStyle}>Confirmar nueva contraseña</label>
        <input {...register('confirmPassword')} type="password" name="confirm-password" autoComplete="new-password" placeholder="••••••••" style={fieldInput} />
        {errors.confirmPassword && <p style={errStyle}>{errors.confirmPassword.message}</p>}
      </div>
      {serverError && <p style={errStyle}>{serverError}</p>}
      {success && <p style={{ fontFamily: 'DM Sans,system-ui', fontSize: '0.7rem', color: '#6a9e6a' }}>Contraseña actualizada.</p>}
      <button type="submit" disabled={isSubmitting} style={{ ...primaryBtn, alignSelf: 'flex-start' }}>
        {isSubmitting ? '...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}

/* ── Section wrapper ─────────────────────────────────── */
function Section({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: `1px solid ${danger ? '#5a2a2a' : 'var(--border)'}`,
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
    }}>
      <p style={{ fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.6rem', color: danger ? '#c06050' : 'var(--text-faint)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 1.25rem' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

/* ── Shared styles ───────────────────────────────────── */
const fieldInput: React.CSSProperties = {
  width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: '8px', padding: '0.65rem 0.875rem',
  fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.8rem', color: 'var(--text)',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
}
const primaryBtn: React.CSSProperties = {
  background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '7px',
  padding: '0.6rem 1.25rem', fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.65rem',
  fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
  whiteSpace: 'nowrap', transition: 'background 0.2s',
}
const outlineBtn: React.CSSProperties = {
  background: 'none', border: '1px solid var(--border)', borderRadius: '7px',
  color: 'var(--text-muted)', fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.65rem',
  letterSpacing: '0.1em', padding: '0.6rem 1.25rem', cursor: 'pointer', whiteSpace: 'nowrap',
}
const dangerBtn: React.CSSProperties = {
  background: 'none', border: '1px solid #5a2a2a', borderRadius: '7px',
  color: '#c06050', fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.65rem',
  letterSpacing: '0.1em', padding: '0.6rem 1.25rem', cursor: 'pointer', whiteSpace: 'nowrap',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.6rem',
  color: 'var(--text-faint)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem',
}
const errStyle: React.CSSProperties = {
  fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.7rem', color: '#e8735a', marginTop: '0.3rem',
}
