import fs from "fs";
import path from "path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDFDocument } from "pdf-lib";

const INPUT_DIR = "../../../../Downloads/Science-20260124T223403Z-1-001/Science/2023-2024";
const OUTPUT_DIR = "../chemistry/references";

/*
  Put ANY regexes you want here.
  ALL of them must match the same page.
*/
const SEARCH_REGEXES = [
  /PHYSICS/i,
  /Speed of light in a vacuum/i
];

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/*
  23-24_Sci_TMSCA-1.pdf  ->  23-24-TMSCA-1.pdf
*/
function makeOutputName(filename) {
  const base = path.basename(filename, ".pdf");
  const newBase = base.replace("_Sci_", "-");
  return newBase + ".pdf";
}

async function findPageBeforeMatchingAllRegex(pdfPath, regexes) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));

  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map(item => item.str)
      .join(" ");

    const matchesAll = regexes.every(r => r.test(pageText));

    if (matchesAll) {
      if (i === 1) return null;
      return i - 1;
    }
  }

  return null;
}

async function extractSinglePage(inputPath, pageNumber, outputPath) {
  const bytes = fs.readFileSync(inputPath);

  const srcDoc = await PDFDocument.load(bytes);
  const outDoc = await PDFDocument.create();

  const [page] = await outDoc.copyPages(srcDoc, [pageNumber - 1]);
  outDoc.addPage(page);

  const outBytes = await outDoc.save();
  fs.writeFileSync(outputPath, outBytes);
}

async function processYearDirectory(yearDirPath) {
  const files = fs
    .readdirSync(yearDirPath)
    .filter(f => f.toLowerCase().endsWith(".pdf"));

  for (const file of files) {
    if (file.includes("TMSCA")) continue;

    const inputPath = path.join(yearDirPath, file);
    const outputName = makeOutputName(file);
    const outputPath = path.join(OUTPUT_DIR, outputName);

    console.log(`Processing ${inputPath}...`);

    const pageToExtract =
      await findPageBeforeMatchingAllRegex(
        inputPath,
        SEARCH_REGEXES
      );

    if (!pageToExtract) {
      console.warn("  -> no matching reference page found");
      continue;
    }

    await extractSinglePage(
      inputPath,
      pageToExtract,
      outputPath
    );

    console.log(
      `  -> extracted page ${pageToExtract} -> ${outputName}`
    );
  }
}

async function main() {

  // Resolve to a real absolute path first
  const resolvedInput = path.resolve(INPUT_DIR);

  // The folder that contains all year folders
  const parentDir = path.dirname(resolvedInput);

  const yearDirs = fs.readdirSync(parentDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(parentDir, d.name));

  if (yearDirs.length === 0) {
    console.warn("No subdirectories found in:", parentDir);
    return;
  }

  for (const yearDir of yearDirs) {
    console.log(`\n=== Scanning year folder: ${yearDir} ===`);
    await processYearDirectory(yearDir);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
