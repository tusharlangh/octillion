import { parse } from "../services/parse.js";

export async function file_parse_controller(req, res) {
  try {
    const { id, search } = req.query;
    console.log(`id: ${id} anad search: ${search}`);

    const parsed = await parse(id, search);

    return res.json({ message: "it works" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to parse PDFs", detail: error?.message });
  }
}
