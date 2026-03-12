import { test, expect, loginAndSelectCharacter } from './fixtures';

test.describe('Local smoke regression', () => {
  test('@smoke login takes the user through onboarding into chat', async ({ page, request }) => {
    await loginAndSelectCharacter({
      page,
      request,
      characterId: 'akari',
    });

    await expect(page.getByTestId('chat-screen')).toBeVisible();
    await expect(page.getByTestId('chat-character-name')).toContainText('Akari');
  });

  test('@smoke chat can send a message and surface the streamed reply', async ({ page, request }) => {
    await loginAndSelectCharacter({
      page,
      request,
      characterId: 'akari',
    });

    await page.getByTestId('chat-input').fill('Rainy cafes still calm me down.');
    await page.getByTestId('chat-send-button').click();

    await expect(page.getByTestId('message-user')).toContainText('Rainy cafes still calm me down.');
    await expect(page.getByTestId('message-ai').last()).toContainText('I heard you say');
    await expect(page.getByTestId('chat-level-indicator')).toContainText('Warm');
  });

  test('@smoke feed interactions update local post state immediately', async ({ page, request }) => {
    await loginAndSelectCharacter({
      page,
      request,
      characterId: 'mina',
    });

    await page.getByRole('button', { name: 'Feed' }).click();
    await expect(page).toHaveURL(/\/feed$/);

    const firstPost = page.getByTestId('feed-post').first();
    await expect(firstPost).toBeVisible();

    const likeButton = firstPost.getByTestId('feed-like-button');
    await likeButton.click();

    await expect(likeButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('@smoke profile preferences survive save and page reload', async ({ page, request }) => {
    await loginAndSelectCharacter({
      page,
      request,
      characterId: 'akari',
    });

    await page.getByRole('button', { name: 'Profile' }).click();
    await expect(page).toHaveURL(/\/profile$/);

    await page.getByRole('button', { name: 'Preferences' }).click();
    await page.getByTestId('prefs-contact-high').click();
    await page.getByTestId('prefs-teaching-active').click();
    await page.getByTestId('prefs-depth-deep').click();
    await page.getByRole('button', { name: /save preferences/i }).click();

    await page.reload();
    await expect(page).toHaveURL(/\/profile$/);
    await page.getByRole('button', { name: 'Preferences' }).click();

    await expect(page.getByTestId('prefs-contact-high')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('prefs-teaching-active')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('prefs-depth-deep')).toHaveAttribute('aria-pressed', 'true');
  });
});
