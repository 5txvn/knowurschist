// fixDataField.mjs
import fs from "fs/promises";

const inputFile  = "../chemistry/questionBank.json";
const outputFile = "../chemistry/questionBank-fixed.json";

const raw = await fs.readFile(inputFile, "utf8");
const arr = JSON.parse(raw);

if (!Array.isArray(arr)) {
  throw new Error("Input JSON must be an array.");
}

const fixed = arr.map(obj => {
  const out = { ...obj };

  if (!Object.prototype.hasOwnProperty.call(obj, "data")) {
    out.data = false;
  } else if (typeof obj.data !== "boolean") {
    delete out.data;
    out.data = true;
  }

  return out;
});

// 👇 each object on ONE line
const lines = fixed.map(o => JSON.stringify(o));

const output =
  "[\n" +
  lines.join(",\n") +
  "\n]";

await fs.writeFile(outputFile, output, "utf8");

console.log("Done.");