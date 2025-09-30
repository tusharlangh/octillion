import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

export async function parse(link) {
  const loadingTask = pdfjs.getDocument(link); //loads the pdf and dowloads it for use and parses it.

  const pdf = await loadingTask.promise;

  let pagesContent = [];

  // Loop through pages
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items.map((item) => item.str).join(" ");
    pagesContent.push({
      page: pageNum,
      page_content: formatResponse(pageText),
    });
  }

  const inverted = await createInvertedSearch(pagesContent);
  searchContent(inverted);

  return pagesContent;
}

function formatResponse(res) {
  return res
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim();
}

async function createInvertedSearch(pagesContent) {
  const inverted = new Map();

  for (let i = 0; i < pagesContent.length; i++) {
    const { page, page_content } = pagesContent[i];

    for (let c of page_content.split(" ")) {
      if (inverted.has(c)) {
        inverted.get(c).push(page);
      } else {
        inverted.set(c, []);
        inverted.get(c).push(page);
      }
    }
  }

  return inverted;
}

async function searchContent(inverted, search = "three short pages") {
  //yet to handle duplicates in query. grammatical mistakes and extract page numbers
  const wordCounts = new Map();

  wordCounts.set(1, 433);
  wordCounts.set(2, 537);
  wordCounts.set(3, 396);

  const TF = [];
  const appearance = {};

  const N = 3;

  for (let doc = 1; doc <= N; doc++) {
    for (let term of search.split(" ")) {
      let counts = 0;

      if (inverted.has(term)) {
        for (let index of inverted.get(term)) {
          if (index === doc) {
            counts++;
          }
        }
      }

      if (counts > 0) {
        if (!appearance[term]) appearance[term] = [];
        appearance[term].push(doc);
      }

      TF.push({ doc, term, counts, tf: counts / wordCounts.get(doc) });
    }
  }

  const IDF = {};

  for (let term of search.split(" ")) {
    const df = appearance[term] ? appearance[term].length : 0;
    const idf = df === 0 ? 0 : Math.log(N / appearance[term].length);
    IDF[term] = idf;
  }

  const scores = {};

  for (let doc = 1; doc <= N; doc++) {
    let score = 0;
    for (let term of search.split(" ")) {
      for (let i = 0; i < TF.length; i++) {
        const tile = TF[i];
        if (tile.doc === doc && tile.term === term) {
          score += tile.tf * IDF[term];
          break;
        }
      }
    }
    scores[doc] = score;
  }

  console.log(scores);
}
