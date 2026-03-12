import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useProactive } from './useProactive';
import { useProactiveStore } from '../store/proactiveStore';

const {
  apiGetPendingProactive,
  apiMarkProactiveRead,
  apiMarkProactiveReplied,
  apiDismissProactive,
} = vi.hoisted(() => ({
  apiGetPendingProactive: vi.fn(),
  apiMarkProactiveRead: vi.fn(),
  apiMarkProactiveReplied: vi.fn(),
  apiDismissProactive: vi.fn(),
}));

vi.mock('../api/proactive', () => ({
  apiGetPendingProactive,
  apiMarkProactiveRead,
  apiMarkProactiveReplied,
  apiDismissProactive,
}));

const pendingMessages = [
  {
    id: 'msg_1',
    characterId: 'mina',
    triggerType: 'thought_of_you',
    content: 'I passed a rainy cafe and thought of you.',
    scheduledAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    readAt: null,
    repliedAt: null,
  },
];

describe('useProactive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useProactiveStore.setState({
      pendingMessages: [],
      showBanner: false,
      currentBannerMessage: null,
    });
    apiGetPendingProactive.mockReset();
    apiMarkProactiveRead.mockReset();
    apiMarkProactiveReplied.mockReset();
    apiDismissProactive.mockReset();
    apiGetPendingProactive.mockResolvedValue({
      messages: pendingMessages,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('polls immediately and stops polling after unmount', async () => {
    const { unmount } = renderHook(() => useProactive(1000));

    await act(async () => {
      await Promise.resolve();
    });

    expect(apiGetPendingProactive).toHaveBeenCalledTimes(1);
    expect(useProactiveStore.getState().currentBannerMessage?.id).toBe('msg_1');

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(apiGetPendingProactive).toHaveBeenCalledTimes(2);

    unmount();

    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    expect(apiGetPendingProactive).toHaveBeenCalledTimes(2);
  });
});
