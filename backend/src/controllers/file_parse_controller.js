import { parse } from "../services/parse.js";

export async function file_parse_controller(req, res) {
  try {
    const { link } = req.query;
    const parsed = await parse(link);

    res.json({ message: "successfully parsed" });
  } catch (error) {
    console.log(error);
  }
}
