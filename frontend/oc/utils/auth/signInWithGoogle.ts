"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signInWithGoogle() {
  const supabase = await createClient();

  // Get the redirect URL from environment or use localhost for development
  const redirectUrl =
    process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL ||
    (process.env.NODE_ENV === "production"
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : "http://localhost:3000/auth/callback");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error) {
    console.error("OAuth error: ", error);
    throw error;
  }

  if (data.url) {
    redirect(data.url);
  }
}
