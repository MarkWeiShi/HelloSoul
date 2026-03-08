#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const SOURCE_DIR = path.resolve(
  process.cwd(),
  'Character_Image_Gen/output/Akari_WhiteShirt/step4_videos'
);
const TARGET_DIR = path.resolve(process.cwd(), 'frontend/public/chat-videos/akari');

const EMOTIONS = [
  'joy', 'contentment', 'amusement', 'pride', 'love', 'gratitude', 'awe', 'inspiration', 'serenity', 'hope',
  'relief', 'trust', 'admiration', 'compassion', 'elevation', 'enthusiasm', 'playfulness', 'curiosity', 'interest', 'anticipation',
  'satisfaction', 'affection', 'triumph', 'calm_confidence', 'delight',
  'sadness', 'grief', 'disappointment', 'regret', 'shame', 'guilt', 'embarrassment', 'anxiety', 'fear', 'panic',
  'worry', 'frustration', 'irritation', 'annoyance', 'anger', 'rage', 'disgust', 'contempt', 'jealousy', 'envy',
  'distrust', 'suspicion', 'confusion', 'stress', 'exhaustion',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function expectedFileName(emotion) {
  return `Akari_${emotion}.mp4`;
}

function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`[sync] Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  ensureDir(TARGET_DIR);

  const missing = [];
  const copied = [];

  for (const emotion of EMOTIONS) {
    const filename = expectedFileName(emotion);
    const src = path.join(SOURCE_DIR, filename);
    const dest = path.join(TARGET_DIR, filename);

    if (!fs.existsSync(src)) {
      missing.push(filename);
      continue;
    }

    fs.copyFileSync(src, dest);
    copied.push(filename);
  }

  const sourceFiles = fs
    .readdirSync(SOURCE_DIR)
    .filter((name) => name.startsWith('Akari_') && name.endsWith('.mp4'));

  const expectedSet = new Set(EMOTIONS.map(expectedFileName));
  const unexpected = sourceFiles.filter((name) => !expectedSet.has(name));

  console.log(`[sync] Source: ${SOURCE_DIR}`);
  console.log(`[sync] Target: ${TARGET_DIR}`);
  console.log(`[sync] Copied: ${copied.length}`);
  console.log(`[sync] Missing: ${missing.length}`);
  console.log(`[sync] Unexpected in source: ${unexpected.length}`);

  if (missing.length > 0) {
    console.error('[sync] Missing files:');
    for (const file of missing) console.error(`  - ${file}`);
  }

  if (unexpected.length > 0) {
    console.error('[sync] Unexpected files:');
    for (const file of unexpected) console.error(`  - ${file}`);
  }

  if (missing.length > 0) {
    process.exit(1);
  }
}

main();
