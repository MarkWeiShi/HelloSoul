import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useLifestyleFeed } from '../../hooks/useLifestyleFeed';
import { StoryCircles } from './StoryCircles';
import { FeedPost } from './FeedPost';
import { CHARACTERS } from '../../types/persona';
import type { CharacterId } from '../../types/persona';
import { apiGenerateFeed } from '../../api/feed';

export function LifestyleFeed() {
  const {
    posts,
    stories,
    isLoading,
    fetchFeed,
    fetchStories,
    likePost,
    replyToPost,
    savePost,
  } = useLifestyleFeed();
  const [filter, setFilter] = useState<CharacterId | 'all'>('all');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchFeed();
    fetchStories();
  }, []);

  const filteredPosts =
    filter === 'all'
      ? posts
      : posts.filter((p) => p.characterId === filter);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const targetId = filter === 'all' ? 'akari' : filter;
      await apiGenerateFeed(targetId, 3);
      await fetchFeed(1);
    } catch (err) {
      console.error('Failed to generate feed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0B1E] to-[#1E1B4B] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0F0B1E]/80 backdrop-blur-lg border-b border-white/5 px-4 py-3 pt-12">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-amber-400" />
          <h1 className="text-lg font-medium text-white">Lifestyle</h1>
          <div className="ml-auto">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-white/70 bg-white/5 hover:bg-white/10 disabled:opacity-40 transition-all"
            >
              <RefreshCw
                size={12}
                className={generating ? 'animate-spin' : ''}
              />
              {generating ? 'Generating...' : 'New Posts'}
            </button>
          </div>
        </div>

        {/* Stories row */}
        <StoryCircles stories={stories} />
      </div>

      {/* Character filter tabs */}
      <div className="flex px-4 mt-3 gap-2 overflow-x-auto pb-2">
        <FilterChip
          label="All"
          active={filter === 'all'}
          color="#888"
          onClick={() => setFilter('all')}
        />
        {CHARACTERS.map((c) => (
          <FilterChip
            key={c.id}
            label={c.name.split(' ')[0]}
            active={filter === c.id}
            color={c.color}
            onClick={() => setFilter(c.id)}
          />
        ))}
      </div>

      {/* Posts */}
      <div className="px-4 mt-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            Loading feed...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <Sparkles size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No posts yet.</p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-3 px-4 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 transition-all"
            >
              {generating ? 'Generating...' : 'Generate Feed Posts ✨'}
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <FeedPost
                  post={post}
                  onLike={() => likePost(post.id)}
                  onReply={(text) => replyToPost(post.id, text)}
                  onSave={() => savePost(post.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
      style={
        active
          ? { backgroundColor: color, color: '#fff' }
          : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }
      }
    >
      {label}
    </button>
  );
}
