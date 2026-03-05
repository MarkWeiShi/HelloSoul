import React from 'react';

export interface EmotionAvatarProps {
  emotionState: string; // e.g. 'EMO_01'
  gazeDirection: string; // e.g. 'user', 'away', 'down'
}

export const EmotionAvatar: React.FC<EmotionAvatarProps> = ({ emotionState, gazeDirection }) => {
  // TODO: Map emotionState to illustration/animation
  // TODO: Map gazeDirection to avatar orientation
  return (
    <div
      className={`avatar avatar-${emotionState} gaze-${gazeDirection}`}
      style={{
        width: '286px', // 1/10th of iPhone 16 Pro Max width
        height: '286px',
        maxWidth: '100vw',
        maxHeight: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Placeholder: Replace with actual image/animation */}
      <img
        src={`/assets/akari/${emotionState}.png`}
        alt={emotionState}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '50%',
        }}
      />
    </div>
  );
};
