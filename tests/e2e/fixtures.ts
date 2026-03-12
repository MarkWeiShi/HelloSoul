import fs from 'node:fs/promises';
import path from 'node:path';
import { test as base, expect } from '@playwright/test';

type ConsoleEntry = {
  type: string;
  text: string;
  location?: string;
};

type NetworkEntry = {
  type: 'response' | 'requestfailed';
  url: string;
  method: string;
  status?: number;
  failureText?: string;
};

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const consoleEntries: ConsoleEntry[] = [];
    const networkEntries: NetworkEntry[] = [];
    const pageErrors: { message: string; stack?: string }[] = [];

    page.on('console', (message) => {
      consoleEntries.push({
        type: message.type(),
        text: message.text(),
        location: message.location().url,
      });
    });

    page.on('pageerror', (error) => {
      pageErrors.push({
        message: error.message,
        stack: error.stack,
      });
    });

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        networkEntries.push({
          type: 'response',
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
        });
      }
    });

    page.on('requestfailed', (request) => {
      networkEntries.push({
        type: 'requestfailed',
        url: request.url(),
        method: request.method(),
        failureText: request.failure()?.errorText,
      });
    });

    await use(page);

    await fs.mkdir(testInfo.outputDir, { recursive: true });
    await fs.writeFile(
      testInfo.outputPath('browser-console.json'),
      JSON.stringify(consoleEntries, null, 2)
    );
    await fs.writeFile(
      testInfo.outputPath('network.json'),
      JSON.stringify(networkEntries, null, 2)
    );
    await fs.writeFile(
      testInfo.outputPath('page-errors.json'),
      JSON.stringify(pageErrors, null, 2)
    );
  },
});

export async function resetE2EState(request: import('@playwright/test').APIRequestContext) {
  const response = await request.post('http://127.0.0.1:3001/api/test/reset');
  expect(response.ok()).toBeTruthy();
  return response.json();
}

export async function loginAndSelectCharacter(params: {
  page: import('@playwright/test').Page;
  request: import('@playwright/test').APIRequestContext;
  email?: string;
  password?: string;
  characterId: 'akari' | 'mina' | 'sophie' | 'carlos';
}) {
  const seed = await resetE2EState(params.request);
  const email = params.email || seed.user.email;
  const password = params.password || seed.user.password;

  await params.page.goto('/login');
  await params.page.getByPlaceholder('Email').fill(email);
  await params.page.getByPlaceholder('Password').fill(password);
  await params.page.getByRole('button', { name: /sign in/i }).click();
  await expect(params.page).toHaveURL(/\/onboarding$/);
  await params.page.getByTestId(`character-card-${params.characterId}`).click();
  await expect(params.page).toHaveURL(/\/chat$/);
}

export { expect };
