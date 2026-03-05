import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';

interface Story {
  id: string;
  title: string;
  description: string;
  durationMin: number;
}

interface BedtimeStoryProps {
  characterId: string;
  characterName: string;
  characterColor: string;
  stories: Story[];
  onClose: () => void;
}

export function BedtimeStory({
  characterId,
  characterName,
  characterColor,
  stories,
  onClose,
}: BedtimeStoryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const { playAudioUrl, stopAudio } = useVoice();
  const timerRef = useRef<NodeJS.Timeout>();

  const selected = stories[selectedIdx];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAudio();
    };
  }, []);

  const togglePlay = () => {
    if (playing) {
      stopAudio();
      if (timerRef.current) clearInterval(timerRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      // Simulate progress
      timerRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(timerRef.current!);
            setPlaying(false);
            return 0;
          }
          return p + 0.5;
        });
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0718] flex flex-col">
      {/* Sleep gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${characterColor}15, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-12">
        <div className="flex items-center gap-2">
          <Moon size={18} style={{ color: characterColor }} />
          <span className="text-sm text-white/70">Bedtime Stories</span>
        </div>
        <button onClick={onClose} className="p-2">
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Story selector */}
      <div className="relative z-10 px-4 mt-4">
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex gap-3 w-max">
            {stories.map((story, i) => (
              <button
                key={story.id}
                onClick={() => {
                  setSelectedIdx(i);
                  setProgress(0);
                  setPlaying(false);
                }}
                className="w-48 shrink-0 p-3 rounded-xl text-left transition-all"
                style={{
                  backgroundColor:
                    i === selectedIdx ? `${characterColor}20` : 'rgba(255,255,255,0.03)',
                  border:
                    i === selectedIdx
                      ? `1px solid ${characterColor}40`
                      : '1px solid transparent',
                }}
              >
                <span className="text-sm font-medium text-white/80 block mb-1">
                  {story.title}
                </span>
                <span className="text-[10px] text-gray-500">
                  {story.durationMin} min
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Now playing */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center gap-8 px-8">
        {/* Moon illustration */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${characterColor}30, ${characterColor}05)`,
            boxShadow: `0 0 60px ${characterColor}15`,
          }}
        >
          <Moon size={48} style={{ color: characterColor }} className="opacity-60" />
        </motion.div>

        <div className="text-center">
          <h2 className="text-xl font-serif text-white/90">
            {selected?.title || 'Select a story'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Told by {characterName}
          </p>
          {selected?.description && (
            <p className="text-xs text-gray-600 mt-2 max-w-xs">
              {selected.description}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: characterColor }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => {
              setSelectedIdx(Math.max(0, selectedIdx - 1));
              setProgress(0);
            }}
            className="p-2 text-gray-500 hover:text-white transition"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: characterColor }}
          >
            {playing ? (
              <Pause size={24} className="text-white" />
            ) : (
              <Play size={24} className="text-white ml-1" />
            )}
          </button>

          <button
            onClick={() => {
              setSelectedIdx(Math.min(stories.length - 1, selectedIdx + 1));
              setProgress(0);
            }}
            className="p-2 text-gray-500 hover:text-white transition"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      {/* Sleep timer hint */}
      <div className="relative z-10 text-center pb-8">
        <p className="text-[10px] text-gray-600">
          Volume will gradually decrease as the story ends
        </p>
      </div>
    </div>
  );
}
