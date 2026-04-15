const fs = require("fs");
const path = require("path");

const SCREENSHOT_FOLDER = String.raw`C:\Users\SL\Pictures\Screenshots`;
const IDENTIFIER_FILE = "identifiers.json";
const IMAGE_FOLDER = "../chemistry/images";

function renameScreenshots() {

    const identifiers = JSON.parse(fs.readFileSync(IDENTIFIER_FILE, "utf8"));

    let screenshots = fs.readdirSync(SCREENSHOT_FOLDER)
        .filter(f => f.startsWith("Screenshot"));

    // Sort by timestamp extracted from filename
    screenshots.sort((a, b) => {

        const timeA = a.match(/\d{4}-\d{2}-\d{2} (\d+)/)?.[1] || 0;
        const timeB = b.match(/\d{4}-\d{2}-\d{2} (\d+)/)?.[1] || 0;

        return Number(timeA) - Number(timeB);
    });

    const count = Math.min(identifiers.length, screenshots.length);

    for (let i = 0; i < count; i++) {

        const oldPath = path.join(SCREENSHOT_FOLDER, screenshots[i]);
        const newName = `${identifiers[i]}.png`;
        const newPath = path.join(IMAGE_FOLDER, newName);

        fs.renameSync(oldPath, newPath);

        console.log(`${screenshots[i]} → ${newName}`);

    }

    console.log(`\nRenamed ${count} screenshots.`);
}

renameScreenshots();