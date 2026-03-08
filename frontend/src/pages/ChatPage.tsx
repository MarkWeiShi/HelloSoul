import React, { useEffect, useState } from 'react';
import { EmotionAvatar } from '../components/EmotionAvatar';
import { SceneBackground } from '../components/SceneBackground';

export const ChatPage: React.FC = () => {
  const [emotionKey, setEmotionKey] = useState('contentment');
  const [gazeDirection, setGazeDirection] = useState('user');
  const [sceneId, setSceneId] = useState('cafe');

  useEffect(() => {
    // Fetch from backend API
    fetch('/api/chat/context')
      .then(res => res.json())
      .then(data => {
        setEmotionKey(data.emotion?.key || 'contentment');
        setGazeDirection(data.gazeDirection);
        setSceneId(data.sceneId);
      });
  }, []);

  return (
    <div
      className="chat-page"
      style={{
        width: '2868px',
        height: '1320px',
        maxWidth: '100vw',
        maxHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        margin: '0 auto',
        background: '#0F0B1E',
      }}
    >
      <SceneBackground sceneId={sceneId} />
      <div style={{ position: 'absolute', left: '50%', top: '60%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
        <EmotionAvatar emotionKey={emotionKey} gazeDirection={gazeDirection} />
      </div>
      {/* ...rest of chat UI... */}
    </div>
  );
};
