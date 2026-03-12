import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { HeartbeatRitual } from './HeartbeatRitual';
import { BackgroundAmbience } from './BackgroundAmbience';
import { ApiError } from '../../api/base';
import { apiStartVoiceCall } from '../../api/voice';

type CallState = 'loading_access' | 'locked' | 'pre_ritual' | 'active' | 'ending';

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
  const [state, setState] = useState<CallState>('loading_access');
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [gateMessage, setGateMessage] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    setState('loading_access');
    setGateMessage(null);
    setCurrentScore(null);

    apiStartVoiceCall(characterId)
      .then(() => {
        if (!cancelled) {
          setState('pre_ritual');
        }
      })
      .catch((error) => {
        if (cancelled) return;

        if (error instanceof ApiError) {
          setGateMessage(error.message);
          setCurrentScore(typeof error.body?.currentScore === 'number' ? error.body.currentScore : null);
        } else {
          setGateMessage(error instanceof Error ? error.message : 'Failed to start voice call.');
        }
        setState('locked');
      });

    return () => {
      cancelled = true;
    };
  }, [characterId]);

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
        {state === 'loading_access' && (
          <motion.div
            key="loading"
            data-testid="voice-call-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center"
          >
            <Phone size={40} style={{ color: characterColor }} />
            <p className="text-sm text-gray-400">Checking whether the call is available...</p>
          </motion.div>
        )}

        {state === 'locked' && (
          <motion.div
            key="locked"
            data-testid="voice-call-locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center"
          >
            <PhoneOff size={40} className="text-red-400" />
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-white">Voice call locked</h2>
              <p className="text-sm text-gray-400">
                {gateMessage || 'Voice calls are not available right now.'}
              </p>
              {currentScore !== null && (
                <p className="text-xs text-gray-500">
                  Current intimacy score: {currentScore}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onEnd}
              className="px-4 py-2 rounded-full bg-white/10 text-sm text-white"
            >
              Back to chat
            </button>
          </motion.div>
        )}

        {state === 'pre_ritual' && (
          <motion.div
            key="ritual"
            data-testid="voice-call-ritual"
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
            data-testid="voice-call-active"
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
