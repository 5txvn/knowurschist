const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'physics', 'questionBank.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const DASH_LINE = '―'.repeat(60);

function getTestFromId(id) {
  const match = id.match(/^(.+)-q\d+$/);
  return match ? match[1] : id;
}

let lastTest = null;

for (const q of data) {
  const test = getTestFromId(q.id);

  if (lastTest !== null && test !== lastTest) {
    console.log(DASH_LINE);
  }
  lastTest = test;

  const correctIndex = q.answer != null ? q.answer : -1;
  const correctLetter = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : '?';
  console.log(`${q.id} : ${correctLetter}`);
}
