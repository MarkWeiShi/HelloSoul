import { test, expect, loginAndSelectCharacter } from './fixtures';

test.describe('Local full regression', () => {
  test('@full chat history restores for seeded conversations and switching characters clears old history', async ({ page, request }) => {
    await loginAndSelectCharacter({
      page,
      request,
      characterId: 'mina',
    });

    await expect(page.getByTestId('message-ai').last()).toContainText('Good. Keep that honesty. It suits you.');

    await page.goto('/onboarding');
    await page.getByTestId('character-card-akari').click();
    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByText('Good. Keep that honesty. It suits you.')).toHaveCount(0);
  });

  test('@full journal, deep profile, and growth report pages load seeded data', async ({ page, request }) => {
    await loginAndSelectCharacter({
      page,
      request,
      characterId: 'mina',
    });

    await page.getByRole('button', { name: 'Journal' }).click();
    await expect(page).toHaveURL(/\/journal$/);
    await expect(page.getByText('You admitted the day felt heavier than usual.')).toBeVisible();

    await page.getByRole('button', { name: 'Stats' }).click();
    await expect(page.getByText('What part of today felt the most like you?')).toBeVisible();

    await page.getByRole('button', { name: 'Profile' }).click();
    await page.getByRole('button', { name: /what mina knows/i }).click();
    await expect(page).toHaveURL(/\/deep-profile$/);
    await expect(page.getByText(/What Mina Knows About You/i)).toBeVisible();

    await page.goto('/profile');
    await page.getByRole('button', { name: 'Growth Report' }).click();
    await expect(page).toHaveURL(/\/growth-report$/);
    await expect(page.getByText(/Monthly Growth Map/i)).toBeVisible();
  });

  test('@full proactive banner can be dismissed', async ({ page, request }) => {
    await loginAndSelectCharacter({
      page,
      request,
      characterId: 'mina',
    });

    const banner = page.getByTestId('proactive-banner');
    await expect(banner).toBeVisible();
    await banner.getByTestId('proactive-dismiss-button').click();
    await expect(banner).toBeHidden();
  });

  test('@full voice call shows locked and unlocked states based on intimacy', async ({ page, request }) => {
    await loginAndSelectCharacter({
      page,
      request,
      characterId: 'akari',
    });

    await page.getByTestId('chat-call-button').click();
    await expect(page).toHaveURL(/\/call$/);
    await expect(page.getByTestId('voice-call-locked')).toBeVisible();
    await expect(page.getByText(/unlock/i)).toBeVisible();

    await page.goto('/onboarding');
    await page.getByTestId('character-card-carlos').click();
    await page.getByTestId('chat-call-button').click();

    await expect(page.getByTestId('voice-call-ritual')).toBeVisible();
    await page.getByRole('button', { name: /skip ritual/i }).click();
    await expect(page.getByTestId('voice-call-active')).toBeVisible();
  });
});
