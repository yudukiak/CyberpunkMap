import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '~/config'

export function createClient(request: Request, schema: string = 'public') {
  const headers = new Headers()

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '') as {
            name: string
            value: string
          }[]
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
          )
        },
      },
      db: { schema }
    }
  )

  return { supabase, headers }
}