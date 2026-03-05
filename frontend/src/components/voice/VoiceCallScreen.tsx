import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { HeartbeatRitual } from './HeartbeatRitual';
import { BackgroundAmbience } from './BackgroundAmbience';

type CallState = 'pre_ritual' | 'active' | 'ending';

interface VoiceCallScreenProps {
  characterId: string;
  characterName: string;
  characterColor: string;
  avatarUrl?: string;
  onEnd: () => void;
}

export function VoiceCallScreen({
  characterId,
  characterName,
  characterColor,
  avatarUrl,
  onEnd,
}: VoiceCallScreenProps) {
  const [state, setState] = useState<CallState>('pre_ritual');
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  // Timer for active call
  useEffect(() => {
    if (state !== 'active') return;
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [state]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleRitualComplete = () => {
    setState('active');
  };

  const handleEndCall = () => {
    setState('ending');
    setTimeout(onEnd, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F0B1E] flex flex-col">
      <AnimatePresence mode="wait">
        {/* Pre-call Heartbeat Ritual */}
        {state === 'pre_ritual' && (
          <motion.div
            key="ritual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <HeartbeatRitual
              characterName={characterName}
              characterColor={characterColor}
              onComplete={handleRitualComplete}
            />
          </motion.div>
        )}

        {/* Active Call */}
        {state === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-between py-16"
          >
            {/* Background ambience */}
            <BackgroundAmbience characterId={characterId} />

            {/* Avatar + Status */}
            <div className="flex flex-col items-center gap-4">
              {/* Pulsing ring */}
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${characterColor}` }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center text-4xl"
                  style={{ backgroundColor: `${characterColor}20` }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      className="w-full h-full rounded-full object-cover"
                      alt={characterName}
                    />
                  ) : (
                    <span>{characterName[0]}</span>
                  )}
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-medium text-white">{characterName}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {formatTime(duration)}
                </p>
              </div>

              {/* Audio visualizer */}
              <div className="flex items-end gap-1 h-8">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full"
                    style={{ backgroundColor: characterColor }}
                    animate={{
                      height: [4, Math.random() * 28 + 4, 4],
                    }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => setMuted(!muted)}
                className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10"
              >
                {muted ? (
                  <MicOff size={22} className="text-red-400" />
                ) : (
                  <Mic size={22} className="text-white" />
                )}
              </button>

              <button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500"
              >
                <PhoneOff size={24} className="text-white" />
              </button>

              <button className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10">
                <Volume2 size={22} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Ending */}
        {state === 'ending' && (
          <motion.div
            key="ending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4"
          >
            <motion.div
              animate={{ scale: [1, 0.8], opacity: [1, 0] }}
              transition={{ duration: 1.5 }}
            >
              <Phone size={48} style={{ color: characterColor }} />
            </motion.div>
            <p className="text-gray-400 text-sm">Call ended</p>
            <p className="text-white/70 text-lg font-serif">
              {formatTime(duration)} with {characterName}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
