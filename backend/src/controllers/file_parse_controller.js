import { parse } from "../services/parse.js";

export async function file_parse_controller(req, res) {
  try {
    const { id, files } = req.body;
    console.log(`id: ${id} anad files: ${files}`);

    return res.json({ message: parsed });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to parse PDFs", detail: error?.message });
  }
}
