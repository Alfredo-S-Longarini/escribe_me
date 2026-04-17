import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    // Read from html attribute (already set by BaseLayout inline script)
    const current = document.documentElement.getAttribute('data-theme') as 'dark' | 'light'
    setTheme(current ?? 'dark')
  }, [])

  const toggle = async () => {
    const next = theme === 'dark' ? 'light' : 'dark'

    // Apply immediately
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('em_theme', next)
    setTheme(next)

    // Persist in Supabase asynchronously
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', user.id).single()
    if (profile) {
      await supabase.from('profiles').update({
        preferences: { ...profile.preferences, theme: next },
      }).eq('id', user.id)
    }
  }

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: '5px',
        color: 'var(--text-faint)',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        fontSize: '0.6rem',
        letterSpacing: '0.08em',
        padding: '4px 8px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'border-color 0.2s, color 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-faint)' }}
    >
      {theme === 'dark' ? '☀ Claro' : '☾ Oscuro'}
    </button>
  )
}
