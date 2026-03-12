import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '../../types/chat';
import { InnerVoiceBubble } from './InnerVoiceBubble';
import { speak, stopSpeaking, isTTSAvailable } from '../../utils/tts';

interface MessageBubbleProps {
  message: Message;
  characterColor: string;
  onRevealInnerVoice: (messageId: string) => void;
}

export function MessageBubble({
  message,
  characterColor,
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
      data-testid={`message-${message.role}`}
      className={`flex ${isAi ? 'justify-start' : 'justify-end'} px-5`}
      style={{ animation: 'fadeInUp 300ms ease-out both' }}
    >
      <div style={{ maxWidth: '75%' }}>
        <div
          className="relative"
          style={
            isAi
              ? {
                  padding: 'var(--akari-space-md) var(--akari-space-base)',
                  borderRadius:
                    'var(--akari-radius-xl) var(--akari-radius-xl) var(--akari-radius-xl) var(--akari-space-xs)',
                  background: 'var(--akari-bubble-akari)',
                  border: '1px solid var(--akari-border-subtle)',
                  wordBreak: 'break-word',
                }
              : {
                  padding: 'var(--akari-space-md) var(--akari-space-base)',
                  borderRadius:
                    'var(--akari-radius-xl) var(--akari-radius-xl) var(--akari-space-xs) var(--akari-radius-xl)',
                  background: 'var(--akari-bubble-user)',
                  border: '1px solid var(--akari-border-accent)',
                  wordBreak: 'break-word',
                }
          }
        >
          {isAi && message.memoryRef && (
            <div
              className="mb-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px]"
              style={{
                backgroundColor: `${characterColor}14`,
                border: `1px solid ${characterColor}30`,
                color: characterColor,
              }}
            >
              <span>Remembered</span>
              <span>
                {new Date(message.memoryRef.date).toLocaleDateString()}
              </span>
            </div>
          )}

          <p
            className="whitespace-pre-wrap"
            style={{
              color: 'var(--akari-text-primary)',
              fontSize: '15px',
              lineHeight: 1.5,
              fontWeight: 400,
              margin: 0,
            }}
          >
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

          {isAi && message.relationshipProgress && (
            <div
              className="mt-2 inline-flex items-center rounded-full px-2 py-1 text-[10px]"
              style={{
                backgroundColor: `${characterColor}12`,
                color: characterColor,
                border: `1px solid ${characterColor}26`,
              }}
            >
              Relationship advanced to {message.relationshipProgress.label}
            </div>
          )}

          <span
            style={{
              display: 'block',
              marginTop: 'var(--akari-space-xs)',
              color: 'var(--akari-text-muted)',
              fontSize: '11px',
              lineHeight: 1,
              textAlign: isAi ? 'left' : 'right',
            }}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
