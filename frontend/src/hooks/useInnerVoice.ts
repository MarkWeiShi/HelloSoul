import { useCallback, useState } from 'react';

/**
 * Hook to manage inner voice reveal state locally.
 */
export function useInnerVoice() {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const reveal = useCallback((messageId: string) => {
    setRevealedIds((prev) => new Set(prev).add(messageId));
  }, []);

  const isRevealed = useCallback(
    (messageId: string) => revealedIds.has(messageId),
    [revealedIds]
  );

  return { reveal, isRevealed };
}
