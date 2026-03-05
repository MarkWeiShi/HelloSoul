import { useEffect, useRef } from 'react';

interface BackgroundAmbienceProps {
  characterId: string;
}

// City-specific ambient descriptions (visual only for MVP, audio TBD)
const AMBIENCE_CONFIG: Record<
  string,
  { particles: string[]; gradient: string }
> = {
  akari: {
    particles: ['🌸', '✨', '🏮'],
    gradient: 'radial-gradient(circle at 30% 70%, rgba(255,107,157,0.05), transparent 60%)',
  },
  mina: {
    particles: ['💜', '✨', '🌙'],
    gradient: 'radial-gradient(circle at 70% 30%, rgba(123,104,238,0.05), transparent 60%)',
  },
  sophie: {
    particles: ['🌟', '✨', '🕯️'],
    gradient: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.05), transparent 60%)',
  },
  carlos: {
    particles: ['🎵', '✨', '🌊'],
    gradient: 'radial-gradient(circle at 40% 60%, rgba(0,206,209,0.05), transparent 60%)',
  },
};

export function BackgroundAmbience({ characterId }: BackgroundAmbienceProps) {
  const config = AMBIENCE_CONFIG[characterId] || AMBIENCE_CONFIG.akari;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ background: config.gradient }}
    >
      {/* Floating particles */}
      {config.particles.map((emoji, i) =>
        Array.from({ length: 3 }).map((_, j) => (
          <span
            key={`${i}-${j}`}
            className="absolute text-sm opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${(i * 3 + j) * 1.5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          >
            {emoji}
          </span>
        ))
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          25% { transform: translateY(-30px) rotate(5deg); opacity: 0.25; }
          50% { transform: translateY(-15px) rotate(-3deg); opacity: 0.15; }
          75% { transform: translateY(-40px) rotate(7deg); opacity: 0.2; }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
