import { supabase } from "@/supabaseClient";

export async function handleTokenAction() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting session: ", error);
    return;
  }

  if (data.session) {
    const jwt = data.session.access_token;

    return jwt;
  }
}
