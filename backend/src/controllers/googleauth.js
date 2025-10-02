import { supabase } from "../../supabaseClient.js";

export async function googleAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:5002/dashboard",
    },
  });

  if (error) {
    console.log(error);
  } else {
    console.log("Redirecting to google auth");
  }
}
