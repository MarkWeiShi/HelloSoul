import { useCallback, useState } from 'react';
import { apiGetMemorySummary, apiGetJournalTimeline } from '../api/memory';
import type { JournalEntry } from '../types/memory';

export function useMemory(characterId: string | null) {
  const [summary, setSummary] = useState<string>('');
  const [timeline, setTimeline] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!characterId) return;
    setLoading(true);
    try {
      const data = await apiGetMemorySummary(characterId);
      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to fetch memory summary:', err);
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  const fetchTimeline = useCallback(async () => {
    if (!characterId) return;
    setLoading(true);
    try {
      const data = await apiGetJournalTimeline(characterId);
      setTimeline(data.entries);
    } catch (err) {
      console.error('Failed to fetch journal timeline:', err);
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  return { summary, timeline, loading, fetchSummary, fetchTimeline };
}
