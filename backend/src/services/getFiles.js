import supabase from "../utils/supabase/client.js";

export async function getFiles(id) {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("parse_id", id);

  if (error) {
    console.error(error);
    return;
  }

  const links = data.map((row) => row.files);

  return links[0];
}
