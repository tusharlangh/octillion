import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url); //searchParams is everything after ? in url. like http://localhost:3000/auth/callback?code=ABC123&next=/dashboard, it will return code, next
  const code = searchParams.get("code"); //gets code

  let next = searchParams.get("next") ?? "/"; //the callback url if it exists otherwise /
  if (!next.startsWith("/")) {
    //redirects only on /... and not full urls
    next = "/";
  }

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code); //exchange the voucher for a session. voucher given when you open google auth
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
