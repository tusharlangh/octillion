import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

export async function parse(link) {
  const loadingTask = pdfjs.getDocument(link); //loads the pdf and dowloads it for use and parses it.

  const pdf = await loadingTask.promise;

  let fullText = "";

  // Loop through pages
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += pageText;
  }

  return fullText;
}
