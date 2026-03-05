import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '../../types/chat';

interface VoiceMessageProps {
  message: Message;
  characterColor: string;
}

export function VoiceMessage({ message, characterColor }: VoiceMessageProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (playing) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="max-w-[280px]">
      {/* Waveform player */}
      <div
        className="p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: characterColor }}
          >
            {playing ? '⏸' : '▶'}
          </button>
          {/* Waveform bars */}
          <div className="flex items-center gap-0.5 flex-1 h-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-full"
                style={{ backgroundColor: characterColor, opacity: 0.6 }}
                animate={
                  playing
                    ? {
                        height: [4, 8 + Math.random() * 16, 4],
                        opacity: [0.4, 1, 0.4],
                      }
                    : { height: 4 }
                }
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        </div>
        <audio
          ref={audioRef}
          src={message.audioUrl}
          onEnded={() => setPlaying(false)}
        />
      </div>

      {/* Cultural scene image */}
      {message.sceneImageUrl && (
        <img
          src={message.sceneImageUrl}
          className="w-full h-40 object-cover rounded-xl mt-2"
          alt="cultural scene"
        />
      )}

      {/* Bilingual transcript */}
      {message.transcription && (
        <div className="mt-2 space-y-1">
          <p className="text-sm" style={{ color: characterColor }}>
            {message.transcription}
          </p>
          <p className="text-xs text-gray-400">{message.translation}</p>
          <button
            className="text-xs px-2 py-1 rounded-full border mt-1 transition-colors hover:bg-white/5"
            style={{ borderColor: characterColor, color: characterColor }}
          >
            Learn this phrase →
          </button>
        </div>
      )}
    </div>
  );
}
