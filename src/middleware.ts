import { createServerClient } from '@supabase/ssr'
import { defineMiddleware } from 'astro:middleware'

const PROTECTED = ['/app']

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => {
          const cookieHeader = context.request.headers.get('Cookie') ?? ''
          return cookieHeader.split(';').flatMap(pair => {
            const [name, ...rest] = pair.trim().split('=')
            if (!name) return []
            return [{ name: name.trim(), value: rest.join('=').trim() }]
          })
        },
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            context.cookies.set(name, value, options as any)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = new URL(context.request.url)
  const isProtected = PROTECTED.some(p => url.pathname.startsWith(p))

  if (isProtected && !user) {
    return context.redirect('/auth/login')
  }

  context.locals.supabase = supabase
  context.locals.user = user

  return next()
})
