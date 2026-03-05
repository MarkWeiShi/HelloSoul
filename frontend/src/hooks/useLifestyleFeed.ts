import { useCallback, useEffect } from 'react';
import { useFeedStore } from '../store/feedStore';
import { apiGetFeed, apiGetFeedStories, apiInteractWithPost } from '../api/feed';

export function useLifestyleFeed() {
  const {
    posts,
    stories,
    selectedCharacterFilter,
    isLoading,
    setPosts,
    addPosts,
    setStories,
    setCharacterFilter,
    setLoading,
    updatePostInteraction,
  } = useFeedStore();

  const fetchFeed = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const data = await apiGetFeed(page, selectedCharacterFilter || undefined);
        if (page === 1) {
          setPosts(data.posts);
        } else {
          addPosts(data.posts);
        }
      } catch (err) {
        console.error('Failed to fetch feed:', err);
      } finally {
        setLoading(false);
      }
    },
    [selectedCharacterFilter, setPosts, addPosts, setLoading]
  );

  const fetchStories = useCallback(async () => {
    try {
      const data = await apiGetFeedStories();
      setStories(data.stories);
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    }
  }, [setStories]);

  const likePost = useCallback(
    async (postId: string) => {
      updatePostInteraction(postId, 'userLiked', true);
      await apiInteractWithPost(postId, 'like');
    },
    [updatePostInteraction]
  );

  const replyToPost = useCallback(
    async (postId: string, replyText: string) => {
      updatePostInteraction(postId, 'userReplied', true);
      const result = await apiInteractWithPost(postId, 'reply', replyText);
      return result.interaction.aiFollowUp;
    },
    [updatePostInteraction]
  );

  const savePost = useCallback(
    async (postId: string) => {
      updatePostInteraction(postId, 'userSaved', true);
      await apiInteractWithPost(postId, 'save');
    },
    [updatePostInteraction]
  );

  useEffect(() => {
    fetchFeed(1);
    fetchStories();
  }, [selectedCharacterFilter]);

  return {
    posts,
    stories,
    isLoading,
    selectedCharacterFilter,
    setCharacterFilter,
    fetchFeed,
    fetchStories,
    likePost,
    replyToPost,
    savePost,
  };
}
