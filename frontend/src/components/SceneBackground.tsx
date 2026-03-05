import React from 'react';

export interface SceneBackgroundProps {
  sceneId: string; // e.g. 'cafe', 'apartment', etc.
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({ sceneId }) => {
  // TODO: Map sceneId to background image/animation
  return (
    <div
      className={`scene-bg scene-${sceneId}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '2868px',
        height: '1320px',
        maxWidth: '100vw',
        maxHeight: '100vh',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Placeholder: Replace with actual background */}
      <img
        src={`/assets/scenes/${sceneId}.jpg`}
        alt={sceneId}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
};
