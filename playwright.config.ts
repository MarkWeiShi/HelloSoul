import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [
    ['list'],
    ['json', { outputFile: '.cache/qa/report.json' }],
    ['html', { open: 'never', outputFolder: '.cache/qa/html-report' }],
  ],
  outputDir: '.cache/qa/test-results',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: {
      width: 390,
      height: 844,
    },
  },
  webServer: {
    command: 'npm run dev:e2e',
    url: 'http://127.0.0.1:5173/login',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
