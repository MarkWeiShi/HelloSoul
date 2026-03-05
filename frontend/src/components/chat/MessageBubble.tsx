import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '../../types/chat';
import { InnerVoiceBubble } from './InnerVoiceBubble';
import { speak, stopSpeaking, isTTSAvailable } from '../../utils/tts';

interface MessageBubbleProps {
  message: Message;
  characterColor: string;
  characterName: string;
  onRevealInnerVoice: (messageId: string) => void;
}

export function MessageBubble({
  message,
  characterColor,
  characterName,
  onRevealInnerVoice,
}: MessageBubbleProps) {
  const isAi = message.role === 'ai';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    await speak(message.content, message.characterId || 'sophie', {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isAi ? 'justify-start' : 'justify-end'} mb-3`}
    >
      <div className={`max-w-[75%] ${isAi ? '' : ''}`}>
        {/* Character name */}
        {isAi && (
          <p
            className="text-xs mb-1 ml-1"
            style={{ color: characterColor }}
          >
            {characterName}
          </p>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed relative ${
            isAi
              ? 'rounded-tl-sm'
              : 'rounded-tr-sm'
          }`}
          style={
            isAi
              ? {
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }
              : {
                  background: `${characterColor}22`,
                  border: `1px solid ${characterColor}44`,
                }
          }
        >
          <p className="text-white/90 whitespace-pre-wrap">
            {message.content}
          </p>

          {/* TTS speaker button for AI messages */}
          {isAi && isTTSAvailable() && (
            <button
              onClick={handleSpeak}
              className="mt-1.5 flex items-center gap-1 text-[10px] opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: characterColor }}
              title={isSpeaking ? 'Stop speaking' : 'Listen'}
            >
              {isSpeaking ? '🔊 Speaking...' : '🔈 Listen'}
            </button>
          )}

          {/* Inner voice heart icon */}
          {isAi && message.hasInnerVoice && (
            <InnerVoiceBubble
              innerVoiceText={message.innerVoiceText || ''}
              innerVoiceLanguage={message.innerVoiceLanguage || ''}
              innerVoiceTranslation={message.innerVoiceTranslation || ''}
              innerVoiceAudioUrl={message.innerVoiceAudioUrl}
              characterColor={characterColor}
              revealed={message.innerVoiceRevealed || false}
              onReveal={() => onRevealInnerVoice(message.id)}
            />
          )}
        </div>

        {/* Timestamp */}
        <p className={`text-[10px] text-gray-500 mt-1 ${isAi ? 'ml-1' : 'mr-1 text-right'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  );
}
