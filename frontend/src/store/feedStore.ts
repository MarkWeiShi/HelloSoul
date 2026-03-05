import { create } from 'zustand';
import type { FeedPost, FeedStory } from '../types/feed';

interface FeedState {
  posts: FeedPost[];
  stories: FeedStory[];
  selectedCharacterFilter: string | null;
  isLoading: boolean;

  setPosts: (posts: FeedPost[]) => void;
  addPosts: (posts: FeedPost[]) => void;
  setStories: (stories: FeedStory[]) => void;
  setCharacterFilter: (characterId: string | null) => void;
  setLoading: (loading: boolean) => void;
  updatePostInteraction: (
    postId: string,
    field: 'userLiked' | 'userReplied' | 'userSaved',
    value: boolean
  ) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  stories: [],
  selectedCharacterFilter: null,
  isLoading: false,

  setPosts: (posts) => set({ posts }),
  addPosts: (posts) => set((state) => ({ posts: [...state.posts, ...posts] })),
  setStories: (stories) => set({ stories }),
  setCharacterFilter: (characterId) =>
    set({ selectedCharacterFilter: characterId }),
  setLoading: (loading) => set({ isLoading: loading }),
  updatePostInteraction: (postId, field, value) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, [field]: value } : p
      ),
    })),
}));
