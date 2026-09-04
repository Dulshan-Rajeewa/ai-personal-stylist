import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads/writes cookies for session management.
 *
 * Next.js 14 App Router: `cookies()` must be called inside an async
 * function or a Server Component render — never at module-level.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from a Server Component — cookie mutation
            // is only possible in middleware or Route Handlers.
            // This is safe to ignore; middleware handles token refresh.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client with the service role key.
 * Use ONLY in server-side code where you need to bypass RLS.
 * Never expose the service role key to the client.
 */
export async function createServiceRoleClient() {
  const { createServerClient: createSRClient } = await import('@supabase/ssr');
  const cookieStore = await cookies();

  return createSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Expected in Server Components
          }
        },
      },
    }
  );
}
