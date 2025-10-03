"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SetAuth() {
  const router = useRouter();
  useEffect(() => {
    const { data: authAccess } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          localStorage.setItem("token", session.access_token);
        }

        if (event === "TOKEN_REFRESHED" && session) {
          localStorage.setItem("token", session.access_token);
        }

        if (event === "SIGNED_OUT") {
          router.replace("/login_signin/login");
          localStorage.removeItem("token");
        }
      }
    );

    return () => authAccess.subscription.unsubscribe();
  }, []);

  return null;
}
