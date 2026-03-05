import { useCallback, useEffect, useRef } from 'react';
import {
  apiGetPendingProactive,
  apiMarkProactiveRead,
  apiMarkProactiveReplied,
  apiDismissProactive,
} from '../api/proactive';
import { useProactiveStore } from '../store/proactiveStore';

/**
 * Hook to manage proactive messages — polls for pending messages
 * and provides actions to interact with them.
 */
export function useProactive(pollInterval = 60_000) {
  const {
    pendingMessages,
    showBanner,
    currentBannerMessage,
    setPendingMessages,
    dismissBanner,
    showNextBanner,
    removeMessage,
  } = useProactiveStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      const data = await apiGetPendingProactive();
      setPendingMessages(data.messages || []);
    } catch (err) {
      // Silent fail — proactive messages are non-critical
    }
  }, [setPendingMessages]);

  // Poll on mount & interval
  useEffect(() => {
    fetchPending();
    timerRef.current = setInterval(fetchPending, pollInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchPending, pollInterval]);

  const markRead = useCallback(
    async (messageId: string) => {
      try {
        await apiMarkProactiveRead(messageId);
      } catch {
        // non-critical
      }
    },
    []
  );

  const reply = useCallback(
    async (messageId: string) => {
      try {
        await apiMarkProactiveReplied(messageId);
        removeMessage(messageId);
      } catch {
        // non-critical
      }
    },
    [removeMessage]
  );

  const dismiss = useCallback(
    async (messageId: string) => {
      try {
        await apiDismissProactive(messageId);
        removeMessage(messageId);
        showNextBanner();
      } catch {
        // non-critical
      }
    },
    [removeMessage, showNextBanner]
  );

  return {
    pendingMessages,
    showBanner,
    currentBannerMessage,
    dismissBanner,
    markRead,
    reply,
    dismiss,
    refresh: fetchPending,
  };
}
