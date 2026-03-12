import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, ApiError } from './base';
import { useUserStore } from '../store/userStore';

describe('apiFetch', () => {
  beforeEach(() => {
    localStorage.clear();
    useUserStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
    vi.stubGlobal('fetch', vi.fn());
  });

  it('includes authorization headers from the user store', async () => {
    useUserStore.setState({
      token: 'token_123',
      user: { id: 'user_1', email: 'qa@hellosoul.local', username: 'qa_user' },
      isAuthenticated: true,
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    await apiFetch('/profile/deep/akari');

    expect(fetch).toHaveBeenCalledWith(
      '/api/profile/deep/akari',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer token_123',
        }),
      })
    );
  });

  it('throws an ApiError with status and parsed body details', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        error: 'Voice calls unlock at intimacy level 80+',
        currentScore: 15,
      }),
    } as Response);

    const error = await apiFetch('/voice/call/start', {
      method: 'POST',
    }).catch((cause) => cause);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(403);
    expect(error.message).toMatch(/unlock/i);
    expect(error.body.currentScore).toBe(15);
  });
});
