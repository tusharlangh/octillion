import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
            cookiesToSet.forEach(({ name, value, options }) => {
              // Preserve Supabase's original cookie options, but ensure cross-browser compatibility
              const cookieOptions = {
                ...options,
                // Only override if not explicitly set by Supabase
                sameSite: options?.sameSite ?? "lax",
                // In production, use secure if not set, but respect Supabase's settings
                secure: options?.secure ?? (process.env.NODE_ENV === "production" ? true : undefined),
                // Preserve path if set, otherwise default to root
                path: options?.path ?? "/",
              };
              
              // Remove undefined values to avoid issues
              Object.keys(cookieOptions).forEach(key => {
                if (cookieOptions[key] === undefined) {
                  delete cookieOptions[key];
                }
              });
              
              cookieStore.set(name, value, cookieOptions);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.error("Error setting cookies in server client:", error);
          }
        },
      },
    }
  );
}
