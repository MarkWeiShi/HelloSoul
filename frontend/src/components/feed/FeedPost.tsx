import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Globe,
  Camera,
  Star,
  Trophy,
  MapPin,
  BookOpen,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import { CHARACTERS } from '../../types/persona';
import type { FeedPost as FeedPostType } from '../../types/feed';

interface FeedPostProps {
  post: FeedPostType;
  onLike: () => void;
  onReply: (text: string) => void;
  onSave: () => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  life_moment: <Camera size={12} />,
  cultural_question: <Globe size={12} />,
  language_challenge: <Star size={12} />,
  milestone: <Trophy size={12} />,
};

const MOOD_COLORS: Record<string, string> = {
  cozy: '#F59E0B',
  dreamy: '#A78BFA',
  energetic: '#EF4444',
  reflective: '#6366F1',
  playful: '#F472B6',
  warm: '#FB923C',
  moody: '#6B7280',
  golden: '#FBBF24',
};

const TIME_EMOJIS: Record<string, string> = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌇',
  night: '🌙',
  dawn: '🌤',
  dusk: '🌆',
};

export function FeedPost({ post, onLike, onReply, onSave }: FeedPostProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [showLangTip, setShowLangTip] = useState(false);

  const character = CHARACTERS.find((c) => c.id === post.characterId);
  const color = character?.color || '#888';
  const moodColor = post.mood ? MOOD_COLORS[post.mood] || color : color;

  const handleLike = () => {
    setLiked(!liked);
    onLike();
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave();
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    onReply(replyText);
    setReplyText('');
  };

  return (
    <div data-testid="feed-post" className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: `${color}20` }}
        >
          {character?.flag || '🌍'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-white/80">
              {post.characterHandle || post.characterDisplayName || character?.name.split(' ')[0] || 'Character'}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {TYPE_ICONS[post.type] || <Camera size={10} />}
              {post.type.replace('_', ' ')}
            </span>
            {post.mood && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${moodColor}20`, color: moodColor }}
              >
                {post.mood}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500">
              {new Date(post.publishedAt).toLocaleDateString()}
            </span>
            {post.locationTag && (
              <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                <MapPin size={8} />
                {post.locationTag}
              </span>
            )}
            {post.timeOfDay && (
              <span className="text-[10px] text-gray-500">
                {TIME_EMOJIS[post.timeOfDay] || ''} {post.timeOfDay}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Image or image description */}
      {post.imageUrl ? (
        <div className="aspect-[4/3] bg-white/5">
          <img
            src={post.imageUrl}
            alt={post.imageDescription || ''}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : post.imageDescription ? (
        <div
          className="aspect-[4/3] flex items-center justify-center px-6"
          style={{
            background: `linear-gradient(135deg, ${moodColor}15, ${color}10)`,
          }}
        >
          <div className="text-center">
            <Camera size={28} className="mx-auto mb-2 text-white/20" />
            <p className="text-xs text-white/40 italic leading-relaxed max-w-[260px]">
              📸 {post.imageDescription}
            </p>
          </div>
        </div>
      ) : null}

      {/* Caption — bilingual */}
      <div className="p-3">
        <p className="text-sm text-white/85 leading-relaxed">{post.caption}</p>
        {post.nativePhrase && (
          <div className="mt-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${color}10` }}>
            <p className="text-sm font-medium" style={{ color }}>
              {post.nativePhrase}
            </p>
            {post.nativeReading && (
              <p className="text-[10px] text-gray-500 mt-0.5">{post.nativeReading}</p>
            )}
            {post.translation && (
              <p className="text-xs text-gray-400 mt-0.5">{post.translation}</p>
            )}
          </div>
        )}
      </div>

      {/* Cultural note */}
      {(post.culturalNote || post.culturalFact) && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-lg bg-amber-400/5 border border-amber-400/10">
          <div className="flex items-start gap-1.5">
            <Globe size={12} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-200/70 leading-relaxed">
              {post.culturalNote || post.culturalFact}
            </p>
          </div>
        </div>
      )}

      {/* Language tip (expandable) */}
      {post.languageTip && (
        <div className="mx-3 mb-2">
          <button
            onClick={() => setShowLangTip(!showLangTip)}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg transition-colors"
            style={{
              backgroundColor: showLangTip ? `${color}20` : 'rgba(255,255,255,0.03)',
              color: showLangTip ? color : 'rgba(255,255,255,0.4)',
            }}
          >
            <Lightbulb size={11} />
            <span>Language tip</span>
            <BookOpen size={10} />
          </button>
          <AnimatePresence>
            {showLangTip && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-1.5 px-3 py-2 rounded-lg text-[11px] space-y-1"
                  style={{ backgroundColor: `${color}10` }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium" style={{ color }}>
                      {post.languageTip.word}
                    </span>
                    <span className="text-gray-500">{post.languageTip.pronunciation}</span>
                  </div>
                  <p className="text-white/60">{post.languageTip.meaning}</p>
                  <p className="text-white/40 italic">{post.languageTip.usage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Engagement hook */}
      {post.engagementHook && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-lg bg-white/[0.03]">
          <p className="text-xs text-white/50 italic">{post.engagementHook}</p>
        </div>
      )}

      {/* SNS inspiration attribution */}
      {post.snsInspiredBy && post.snsInspiredBy.length > 0 && (
        <div className="px-3 mb-2 flex items-center gap-1 text-[9px] text-gray-600">
          <ExternalLink size={8} />
          <span>vibe inspired by {post.snsInspiredBy.join(', ')}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-3 pb-2">
        <button
          onClick={handleLike}
          type="button"
          data-testid="feed-like-button"
          aria-pressed={liked}
          className="flex items-center gap-1 transition"
        >
          <Heart
            size={18}
            className={liked ? 'text-red-400 fill-red-400' : 'text-gray-500'}
          />
          <span className="text-xs text-gray-500">
            {(post.interactionCount || 0) + (liked ? 1 : 0)}
          </span>
        </button>

        <button
          onClick={() => setShowReply(!showReply)}
          type="button"
          data-testid="feed-reply-toggle"
          className="flex items-center gap-1 text-gray-500"
        >
          <MessageCircle size={18} />
          <span className="text-xs">Reply</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          data-testid="feed-save-button"
          aria-pressed={saved}
          className="ml-auto"
        >
          {saved ? (
            <BookmarkCheck size={18} style={{ color }} />
          ) : (
            <Bookmark size={18} className="text-gray-500" />
          )}
        </button>
      </div>

      {/* Reply input */}
      <AnimatePresence>
        {showReply && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              {aiReply && (
                <div
                  className="text-xs px-3 py-2 rounded-lg mb-2"
                  style={{ backgroundColor: `${color}15`, color: 'rgba(255,255,255,0.7)' }}
                >
                  {aiReply}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                  data-testid="feed-reply-input"
                  placeholder="Say something..."
                  className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-1"
                  style={{ focusRingColor: color } as any}
                />
                <button
                  onClick={handleReply}
                  type="button"
                  data-testid="feed-reply-send"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-white"
                  style={{ backgroundColor: color }}
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
