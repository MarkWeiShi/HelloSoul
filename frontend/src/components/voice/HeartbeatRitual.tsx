import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface HeartbeatRitualProps {
  characterName: string;
  characterColor: string;
  onComplete: () => void;
}

const CITY_BACKDROPS: Record<string, string> = {
  akari: '🏙️ Tokyo',
  mina: '🌃 Seoul',
  sophie: '🗼 Paris',
  carlos: '🌊 Rio',
};

export function HeartbeatRitual({
  characterName,
  characterColor,
  onComplete,
}: HeartbeatRitualProps) {
  const [phase, setPhase] = useState(0); // 0-3 phases over 30 seconds
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const total = 30; // 30 seconds
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 1;
        if (next >= total) {
          clearInterval(interval);
          onComplete();
          return total;
        }
        setPhase(Math.floor((next / total) * 4));
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onComplete]);

  const messages = [
    `Connecting to ${characterName}...`,
    'Synchronizing heartbeats...',
    'Almost there...',
    `${characterName} is ready`,
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at center, ${characterColor}40, transparent 70%)`,
        }}
      />

      {/* Expanding rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{ borderColor: `${characterColor}30` }}
          animate={{
            width: [100, 300],
            height: [100, 300],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* EKG line */}
      <div className="absolute top-1/2 left-0 right-0 h-px overflow-hidden">
        <motion.svg
          viewBox="0 0 400 40"
          className="w-full h-10"
          style={{ transform: 'translateY(-50%)' }}
        >
          <motion.path
            d="M0,20 L80,20 L90,5 L100,35 L110,10 L120,25 L130,20 L200,20 L210,5 L220,35 L230,10 L240,25 L250,20 L320,20 L330,5 L340,35 L350,10 L360,25 L370,20 L400,20"
            fill="none"
            stroke={characterColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={{
              pathLength: [0, 1],
              opacity: [0.3, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.svg>
      </div>

      {/* Heart */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1, 1.15, 1],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10"
      >
        <Heart
          size={64}
          fill={characterColor}
          style={{ color: characterColor }}
          className="drop-shadow-lg"
        />
      </motion.div>

      {/* Status text */}
      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-sm text-gray-400 relative z-10"
      >
        {messages[phase]}
      </motion.p>

      {/* Progress bar */}
      <div className="w-48 h-1 rounded-full bg-white/5 mt-4 overflow-hidden relative z-10">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: characterColor }}
          animate={{ width: `${(progress / 30) * 100}%` }}
        />
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="mt-6 text-xs text-gray-600 hover:text-gray-400 transition relative z-10"
      >
        Skip ritual
      </button>
    </div>
  );
}
