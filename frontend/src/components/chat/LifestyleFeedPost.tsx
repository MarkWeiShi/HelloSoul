import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import type { Message } from '../../types/chat';
import { CHARACTERS } from '../../types/persona';

interface LifestyleFeedPostProps {
  message: Message;
}

export function LifestyleFeedPost({ message }: LifestyleFeedPostProps) {
  const character = CHARACTERS.find((c) => c.id === message.characterId);
  const feedPost = message.feedPost;
  if (!feedPost) return null;

  return (
    <div className="my-3 mx-2 rounded-xl overflow-hidden border border-white/10">
      {/* Scene image */}
      {feedPost.imageUrl && (
        <img
          src={feedPost.imageUrl}
          className="w-full h-40 object-cover"
          alt="lifestyle post"
        />
      )}

      <div className="p-3 bg-white/[0.03]">
        {/* Character info */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{ backgroundColor: character?.color || '#666' }}
          >
            {character?.flag}
          </div>
          <span className="text-xs" style={{ color: character?.color }}>
            {character?.name}
          </span>
          <span className="text-xs text-gray-500">shared a moment</span>
        </div>

        {/* Caption */}
        <p className="text-sm text-white/80 mb-2">{feedPost.caption}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 text-gray-400">
          <button className="flex items-center gap-1 text-xs hover:text-white transition-colors">
            <Heart size={14} /> {feedPost.likeCount}
          </button>
          <button className="flex items-center gap-1 text-xs hover:text-white transition-colors">
            <MessageCircle size={14} /> Reply
          </button>
          <button className="flex items-center gap-1 text-xs hover:text-white transition-colors">
            <Bookmark size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
