import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, MoreHorizontal, Mic, Camera, Send } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useIntimacy } from '../../hooks/useIntimacy';
import { useProactive } from '../../hooks/useProactive';
import { useEmotionStore } from '../../store/emotionStore';
import { MessageBubble } from './MessageBubble';
import { VoiceMessage } from './VoiceMessage';
import { LifestyleFeedPost } from './LifestyleFeedPost';
import { MemoryRecallBubble } from './MemoryRecallBubble';
import { LanguageTipCard } from './LanguageTipCard';
import { EmotionAvatar } from './EmotionAvatar';
import { SceneBackground } from './SceneBackground';
import { ProactiveMessageBanner } from './ProactiveMessageBanner';
import { CHARACTERS } from '../../types/persona';
import type { CharacterId } from '../../types/persona';
import type { Message, EmotionState } from '../../types/chat';

interface ChatInterfaceProps {
  characterId: CharacterId;
  onStartCall?: () => void;
}

export function ChatInterface({ characterId, onStartCall }: ChatInterfaceProps) {
  const navigate = useNavigate();
  const character = CHARACTERS.find((c) => c.id === characterId)!;
  const { messages, isStreaming, streamingContent, sendMessage, revealInnerVoice } =
    useChat();
  const { relationship, currentLevel, progressPercent } =
    useIntimacy(characterId);
  const { currentEmotion, currentSceneId } = useEmotionStore();
  const {
    showBanner,
    currentBannerMessage,
    dismissBanner,
    markRead,
    reply: markReply,
  } = useProactive();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = ['教我怎么说？', '你现在在哪？', '想听你的声音'];

  // Get the latest emotion state from messages
  const latestEmotion: EmotionState | undefined =
    currentEmotion || messages.filter((m) => m.role === 'ai' && m.emotionState).slice(-1)[0]?.emotionState;

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = () => {
    if (input.trim() && !isStreaming) {
      sendMessage(characterId, input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartCall = () => {
    if (onStartCall) {
      onStartCall();
      return;
    }
    navigate('/call');
  };

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'voice':
        return (
          <VoiceMessage
            key={message.id}
            message={message}
            characterColor={character.color}
          />
        );
      case 'lifestyle_post':
        return <LifestyleFeedPost key={message.id} message={message} />;
      case 'memory_recall':
        return (
          <MemoryRecallBubble
            key={message.id}
            message={message}
            characterColor={character.color}
          />
        );
      case 'language_tip':
        return (
          <LanguageTipCard
            key={message.id}
            message={message}
            characterColor={character.color}
          />
        );
      default:
        return (
          <MessageBubble
            key={message.id}
            message={message}
            characterColor={character.color}
            characterName={character.name}
            onRevealInnerVoice={revealInnerVoice}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface relative pb-20">
      {/* Dynamic scene background */}
      <SceneBackground
        sceneId={currentSceneId || undefined}
        characterId={characterId}
        emotionCode={latestEmotion?.current}
      />

      {/* Proactive message banner */}
      <ProactiveMessageBanner
        message={currentBannerMessage}
        show={showBanner}
        characterName={character.name}
        characterColor={character.color}
        onDismiss={() => {
          if (currentBannerMessage) markRead(currentBannerMessage.id);
          dismissBanner();
        }}
        onReply={() => {
          if (currentBannerMessage) {
            setInput(currentBannerMessage.content.slice(0, 30) + '…');
            markReply(currentBannerMessage.id);
            dismissBanner();
          }
        }}
      />

      {/* Header */}
      <div className="flex-shrink-0 relative z-10">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Avatar + status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <EmotionAvatar
                flag={character.flag}
                accentColor={character.color}
                emotionState={latestEmotion}
                size="sm"
              />
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-surface z-20" />
            </div>
            <div>
              <h2 className="text-sm font-medium">{character.name}</h2>
              {currentLevel && (
                <p className="text-[10px]" style={{ color: character.color }}>
                  {currentLevel.nameJa} Lv.{currentLevel.level} 💕
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleStartCall}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <Phone size={18} className="text-gray-400" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <MoreHorizontal size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Intimacy progress bar */}
        <div className="h-0.5 bg-white/5">
          <motion.div
            className="h-full"
            style={{ backgroundColor: character.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 relative z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3"
              style={{ backgroundColor: `${character.color}22` }}
            >
              {character.flag}
            </div>
            <p className="text-sm text-gray-400">
              Start a conversation with {character.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">{character.tagline}</p>
          </div>
        )}

        {messages.map(renderMessage)}

        {/* Streaming indicator */}
        {isStreaming && streamingContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-3"
          >
            <div
              className="max-w-[75%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <p className="text-xs mb-1" style={{ color: character.color }}>
                {character.name}
              </p>
              <p className="text-white/90">{streamingContent}</p>
              <span className="inline-block w-1 h-4 ml-0.5 bg-white/50 animate-pulse" />
            </div>
          </motion.div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex justify-start mb-3">
            <div className="flex gap-1 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: character.color }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick reply chips */}
      <div className="flex-shrink-0 px-4 pb-1 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => {
                setInput(reply);
                sendMessage(characterId, reply);
              }}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 pb-4 relative z-10">
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-surface-light">
          <button
            onClick={() => setInput((prev) => prev || '给你发一张我现在的照片～')}
            className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Camera size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${character.name}...`}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            disabled={isStreaming}
          />
          <button
            onClick={handleStartCall}
            className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Mic size={18} />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-2 rounded-full transition-colors disabled:opacity-30"
            style={{ color: character.color }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
