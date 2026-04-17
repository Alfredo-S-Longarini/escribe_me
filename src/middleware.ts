import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { defineMiddleware } from 'astro:middleware'

const PROTECTED = ['/app']

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () =>
          parseCookieHeader(context.request.headers.get('Cookie') ?? ''),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            context.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = new URL(context.request.url)
  const isProtected = PROTECTED.some((p) => url.pathname.startsWith(p))

  // Solo bloquear rutas privadas si no hay sesión
  // No redirigir desde login/register aunque haya sesión activa
  if (isProtected && !user) {
    return context.redirect('/auth/login')
  }

  context.locals.supabase = supabase
  context.locals.user = user

  return next()
})
