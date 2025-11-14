import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    //Allows the request to continue to its destination
    request: {
      headers: request.headers, //has the original headers
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll(); //get all cookies
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            (
              { name, value, options } //update any expired cookies for supabase to read the most up to date one
            ) => request.cookies.set(name, value) //input cookies what supabase reads. Only available for this middleware
          );
          response = NextResponse.next({
            //creates a new response with the updated headers
            request,
          });
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
            
            response.cookies.set(name, value, cookieOptions);
          }); //output: sends back the updated cookies back to the browser: options here contains info like expires
        },
      },
    }
  );

  // Refresh session to ensure cookies are up to date
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession(); //get the session of the user are they logged in or not and is the session expired or not.

  if (sessionError) {
    console.error("Session error in middleware:", sessionError);
  }

  const isAuthPage = //all the pages where you do not need an id
    request.nextUrl.pathname.startsWith("/login_signin/login") ||
    request.nextUrl.pathname.startsWith("/login_signin/signin") ||
    request.nextUrl.pathname.startsWith("/auth/callback"); // ← Add callback route!

  const isProtectedRoute = !isAuthPage; //all the pages where you need ids

  if (!session && isProtectedRoute) {
    //if the user's session is null and is in a page where you require an id direct them back to the login page.
    const redirectUrl = new URL("/login_signin/login", request.url);
    redirectUrl.searchParams.set("redirect_to", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isAuthPage) {
    //if the user's session exists and are not in one of the pages where you do not require id then direct them to the home page.
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response; //return response (only would work for updating cookies)
}

export const config = {
  //which types of requests you want to track.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
