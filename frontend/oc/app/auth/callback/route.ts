import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url); //searchParams is everything after ? in url. like http://localhost:3000/auth/callback?code=ABC123&next=/dashboard, it will return code, next
  const code = searchParams.get("code"); //gets code

  let next = searchParams.get("next") ?? "/"; //the callback url if it exists otherwise /
  if (!next.startsWith("/")) {
    //redirects only on /... and not full urls
    next = "/";
  }

  if (code) {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.auth.exchangeCodeForSession(code); //exchange the voucher for a session. voucher given when you open google auth

      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(
          `${origin}/auth/auth-code-error?error=${encodeURIComponent(
            error.message
          )}`
        );
      }

      if (data.session) {
        console.log("Session created successfully");

        // Create redirect URL
        const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
        const isLocalEnv = process.env.NODE_ENV === "development";
        const redirectUrl = isLocalEnv
          ? `${origin}${next}`
          : forwardedHost
          ? `https://${forwardedHost}${next}`
          : `${origin}${next}`;

        // Get cookies that were set by Supabase client
        // The cookies() function returns cookies that will be included in the response
        // When we redirect, Next.js should automatically include these cookies
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();

        // Create redirect response - cookies should be automatically included
        // But we explicitly verify they're set for debugging
        const response = NextResponse.redirect(redirectUrl);

        // Log cookies for debugging
        if (allCookies.length > 0) {
          console.log(
            `Setting ${allCookies.length} cookies in redirect response`
          );
        } else {
          console.warn("No cookies found after session exchange");
        }

        return response;
      }
    } catch (error) {
      console.error("Unexpected error in auth callback:", error);
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=unexpected_error`
      );
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`);
}
