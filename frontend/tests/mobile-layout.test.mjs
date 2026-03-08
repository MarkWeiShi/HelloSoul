import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

test('App shell uses runtime viewport height variable for mobile browsers', () => {
  const app = read('src/App.tsx');
  assert.match(
    app,
    /--app-dvh/,
    'Expected App layout to set runtime viewport height CSS variable.'
  );
  assert.match(
    app,
    /window\.innerHeight/,
    'Expected App layout to derive viewport height from window.innerHeight.'
  );
});

test('Bottom navigation includes safe-area inset spacing', () => {
  const nav = read('src/components/shared/Navigation.tsx');
  assert.match(
    nav,
    /safe-area-inset-bottom/,
    'Expected navigation bottom padding to account for iOS safe area inset.'
  );
});

test('Character cards use fluid width instead of hard-coded 280px', () => {
  const select = read('src/components/persona/CharacterSelect.tsx');
  assert.doesNotMatch(
    select,
    /w-\[280px\]/,
    'Expected character cards to avoid fixed 280px width on narrow screens.'
  );
});

test('Chat interface reserves bottom space via shared mobile nav offset variable', () => {
  const chat = read('src/components/chat/ChatInterface.tsx');
  assert.match(
    chat,
    /--akari-nav-offset/,
    'Expected chat layout to reserve bottom space based on nav offset for mobile.'
  );
});

test('Desktop card mode starts at large desktop breakpoint, not tablet width', () => {
  const css = read('src/index.css');
  assert.match(
    css,
    /@media \(min-width:\s*1024px\)/,
    'Expected desktop shell styles to start from 1024px so 768px tablets keep full-screen layout.'
  );
});

test('App frame stays full width by default', () => {
  const css = read('src/index.css');
  assert.match(
    css,
    /\.app-frame\s*\{[\s\S]*?max-width:\s*100%;/,
    'Expected app frame to use full width by default.'
  );
});

test('Desktop pointer devices keep centered narrow frame', () => {
  const css = read('src/index.css');
  assert.match(
    css,
    /@media \(min-width:\s*1024px\)\s+and\s+\(hover:\s*hover\)\s+and\s+\(pointer:\s*fine\)/,
    'Expected width capping to apply only on desktop-like pointer devices.'
  );
  assert.match(
    css,
    /@media[\s\S]*?\.app-frame\s*\{[\s\S]*?max-width:\s*430px;/,
    'Expected desktop media block to cap width at 430px.'
  );
});

test('Chat header accounts for safe-area top inset', () => {
  const chat = read('src/components/chat/ChatInterface.tsx');
  assert.match(
    chat,
    /--akari-safe-top/,
    'Expected chat header to include safe-area top inset on notched devices.'
  );
});

test('Core pages use shared PageLayout wrapper instead of ad-hoc min-h-screen shells', () => {
  const pages = [
    'src/components/pages/AuthPage.tsx',
    'src/components/feed/LifestyleFeed.tsx',
    'src/components/pages/ProfilePage.tsx',
    'src/components/pages/DeepProfilePage.tsx',
    'src/components/pages/GrowthReportPage.tsx',
    'src/components/memory/JournalPage.tsx',
    'src/components/persona/CharacterSelect.tsx',
  ];

  pages.forEach((file) => {
    const content = read(file);
    assert.match(content, /PageLayout/, `Expected ${file} to use shared PageLayout.`);
  });
});

test('Core pages avoid hard-coded bottom nav spacer utility pb-24', () => {
  const pages = [
    'src/components/feed/LifestyleFeed.tsx',
    'src/components/pages/ProfilePage.tsx',
    'src/components/pages/DeepProfilePage.tsx',
    'src/components/pages/GrowthReportPage.tsx',
    'src/components/memory/JournalPage.tsx',
  ];

  pages.forEach((file) => {
    const content = read(file);
    assert.doesNotMatch(
      content,
      /\bpb-24\b/,
      `Expected ${file} to use layout variable spacing instead of pb-24.`
    );
  });
});

test('Proactive message banner is anchored to app frame, not viewport-fixed', () => {
  const banner = read('src/components/chat/ProactiveMessageBanner.tsx');
  assert.doesNotMatch(
    banner,
    /\bfixed\b/,
    'Expected proactive banner to avoid fixed positioning.'
  );
  assert.match(
    banner,
    /\babsolute\b/,
    'Expected proactive banner to be absolutely positioned inside chat frame.'
  );
});
