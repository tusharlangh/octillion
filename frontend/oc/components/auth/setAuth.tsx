"use client";

import { supabase } from "@/supabaseClient";
import { useEffect } from "react";

export function setAuth() {
  useEffect(() => {
    const { data: authAccess } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          localStorage.setItem("token", session.access_token);
        }

        if (event === "SIGNED_OUT") {
          localStorage.removeItem("token");
        }
      }
    );

    return () => authAccess.subscription.unsubscribe();
  }, []);

  return null;
}
