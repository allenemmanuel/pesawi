import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "materials");
const outDir = path.join(root, "public", "brand");
await mkdir(outDir, { recursive: true });

const sports = [
  ["1. Futsal.png", "futsal"],
  ["2. Karom.png", "karom"],
  ["3. Badminton.png", "badminton"],
  ["4. Dart.png", "dart"],
  ["5. Petanque.png", "pentanque"],
  ["6. Ping Pong.png", "pingpong"],
  ["7. Pickelball.png", "pickleball"],
  ["8. Takraw.png", "takraw"],
  ["9. Volleyball.png", "bolatampar"],
];

for (const [file, slug] of sports) {
  await sharp(path.join(srcDir, file))
    .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, alphaQuality: 90 })
    .toFile(path.join(outDir, `sport-${slug}.webp`));
  console.log("sport", slug);
}

await sharp(path.join(srcDir, "PESAWI.png"))
  .resize({ width: 720, withoutEnlargement: true })
  .webp({ quality: 82, alphaQuality: 90 })
  .toFile(path.join(outDir, "wordmark.webp"));
console.log("wordmark");

await sharp(path.join(srcDir, "PESAWI LOGO 2026 (png format).png"))
  .resize({ width: 256, withoutEnlargement: true })
  .webp({ quality: 85, alphaQuality: 90 })
  .toFile(path.join(outDir, "crest.webp"));
console.log("crest");

await sharp(path.join(srcDir, "Logo YSG (BM) with white BG.png"))
  .resize({ width: 320, withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(path.join(outDir, "ysg.webp"));
console.log("ysg");

await sharp(path.join(srcDir, "BACKGROUND ONLY.jpg.jpeg"))
  .resize({ width: 1600, withoutEnlargement: true })
  .webp({ quality: 72 })
  .toFile(path.join(outDir, "bg.webp"));
console.log("bg");

await sharp(path.join(srcDir, "BG PESAWI 1578PX X 997PX.jpg.jpeg"))
  .resize({ width: 1578, withoutEnlargement: true })
  .webp({ quality: 72 })
  .toFile(path.join(outDir, "bg-hero.webp"));
console.log("bg-hero");
