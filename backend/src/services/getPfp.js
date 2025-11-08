import supabase from "../utils/supabase/client.js";

export async function getPfp(userId) {
  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    console.error(error);
    return { success: false, pfp: null };
  }

  return { success: true, pfp: user?.user_metadata?.picture || null };
}
