import { apiFetch } from './base';
import type { FeedPost, FeedStory, SnsProfile } from '../types/feed';

export async function apiGetFeed(page: number = 1, characterId?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (characterId) params.set('characterId', characterId);
  return apiFetch<{ posts: FeedPost[]; page: number }>(
    `/feed?${params.toString()}`
  );
}

export async function apiGetFeedStories() {
  return apiFetch<{ stories: FeedStory[] }>('/feed/stories');
}

export async function apiInteractWithPost(
  postId: string,
  type: 'like' | 'reply' | 'save',
  replyText?: string
) {
  return apiFetch<{ interaction: any }>(`/feed/${postId}/interact`, {
    method: 'POST',
    body: JSON.stringify({ type, replyText }),
  });
}

export async function apiGenerateFeed(characterId: string, count: number = 3) {
  return apiFetch<{ posts: FeedPost[]; count: number }>(
    `/feed/generate/${characterId}?count=${count}`,
    { method: 'POST' }
  );
}

export async function apiGetSnsProfiles() {
  return apiFetch<{ profiles: SnsProfile[] }>('/feed/sns');
}

export async function apiGetSnsProfile(characterId: string) {
  return apiFetch<{ profile: SnsProfile }>(`/feed/sns/${characterId}`);
}
