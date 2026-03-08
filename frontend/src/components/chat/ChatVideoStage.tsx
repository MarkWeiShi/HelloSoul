import { useEffect, useMemo, useRef, useState } from 'react';
import { resolveStageMedia } from '../../config/chatStageMedia';
import type { EmotionKey } from '../../types/chat';
import type { CharacterId } from '../../types/persona';

interface ChatVideoStageProps {
  characterId: CharacterId;
  emotionKey?: EmotionKey;
  characterColor: string;
}

function hexToRgba(color: string, alpha: number): string {
  const value = color.replace('#', '').trim();
  if (value.length !== 6) return `rgba(139,126,200,${alpha})`;

  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function ChatVideoStage({
  characterId,
  emotionKey,
  characterColor,
}: ChatVideoStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const media = useMemo(
    () => resolveStageMedia(characterId, emotionKey),
    [characterId, emotionKey]
  );

  const [activeSrc, setActiveSrc] = useState(media.videoSrc);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    setActiveSrc(media.videoSrc);
    setVideoReady(false);
  }, [media.videoSrc]);

  useEffect(() => {
    videoRef.current?.play().catch(() => {
      setVideoReady(false);
    });
  }, [activeSrc]);

  const glowColor = hexToRgba(characterColor, 0.2);
  const accentColor = characterColor || 'var(--akari-accent-default)';

  return (
    <div
      className="relative h-full overflow-hidden isolate"
      style={{
        background: 'var(--akari-bg-primary)',
        animation: 'stageFadeIn 600ms ease-out both',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, rgba(10,11,20,0.8) 60%, var(--akari-bg-primary) 100%)',
          opacity: videoReady ? 0 : 1,
          transition: 'opacity 300ms ease-out',
          zIndex: 'var(--akari-z-stage-video)',
        }}
      />

      <video
        ref={videoRef}
        key={activeSrc}
        src={activeSrc}
        autoPlay
        muted
        playsInline
        loop
        onCanPlay={() => setVideoReady(true)}
        onError={() => {
          if (activeSrc !== media.fallbackVideoSrc) {
            setActiveSrc(media.fallbackVideoSrc);
            setVideoReady(false);
          }
        }}
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: 'cover',
          objectPosition: 'center top',
          opacity: videoReady ? 1 : 0,
          transition: 'opacity 300ms ease-out',
          zIndex: 'var(--akari-z-stage-video)',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 'var(--akari-z-stage-glow)',
          background: `radial-gradient(ellipse 80% 60% at 50% 60%, ${glowColor} 0%, transparent 70%)`,
          animation: 'glowPulse 4000ms ease-in-out infinite',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 'var(--akari-z-stage-gradient)',
          background:
            'linear-gradient(to bottom, rgba(10, 11, 20, 0) 45%, var(--akari-bg-primary) 100%)',
        }}
      />

      <div
        className="absolute inline-flex items-center"
        style={{
          bottom: 'var(--akari-space-lg)',
          left: 'var(--akari-space-lg)',
          zIndex: 'var(--akari-z-content)',
          padding: 'var(--akari-space-xs) var(--akari-space-md)',
          borderRadius: 'var(--akari-radius-full)',
          background: 'var(--akari-bg-overlay)',
          border: '1px solid var(--akari-border-subtle)',
          backdropFilter: 'blur(var(--akari-blur-sm))',
          WebkitBackdropFilter: 'blur(var(--akari-blur-sm))',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: 'var(--akari-radius-full)',
            background: accentColor,
            marginRight: 'var(--akari-space-sm)',
            boxShadow: `0 0 6px ${accentColor}`,
          }}
        />
        <span
          style={{
            color: 'var(--akari-text-secondary)',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          {media.label}
        </span>
      </div>
    </div>
  );
}
