import { createClient } from "@/utils/supabase/client";

export async function handleTokenAction() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session: ", error);
      return null;
    }

    if (data.session?.access_token) {
      return data.session.access_token;
    }

    return null;
  } catch (error) {
    console.error("Error in handleTokenAction: ", error);
    return null;
  }
}
