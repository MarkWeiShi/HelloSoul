import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import { usePersonaStore } from './store/personaStore';
import { apiGetMe } from './api/base';

// Pages & components
import { AuthPage } from './components/pages/AuthPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { DeepProfilePage } from './components/pages/DeepProfilePage';
import { GrowthReportPage } from './components/pages/GrowthReportPage';
import { CharacterSelect } from './components/persona/CharacterSelect';
import { ChatInterface } from './components/chat/ChatInterface';
import { LifestyleFeed } from './components/feed/LifestyleFeed';
import { JournalPage } from './components/memory/JournalPage';
import { VoiceCallScreen } from './components/voice/VoiceCallScreen';
import { Navigation } from './components/shared/Navigation';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function CharacterGate({ children }: { children: React.ReactNode }) {
  const { selectedCharacterId } = usePersonaStore();
  if (!selectedCharacterId) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  const { token, setAuth, logout } = useUserStore();
  const { selectedCharacterId, getCharacter, selectCharacter } = usePersonaStore();
  const navigate = useNavigate();
  const character = selectedCharacterId ? getCharacter(selectedCharacterId) : null;

  // Restore session on mount
  useEffect(() => {
    if (token) {
      apiGetMe()
        .then((data) => setAuth(token, data.user))
        .catch(() => logout());
    }
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#0F0B1E',
        color: 'white',
        fontFamily: 'DM Sans, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          width: '2868px',
          height: '1320px',
          boxShadow: '0 0 32px #0008',
          background: '#0F0B1E',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<AuthPage />} />

          {/* Onboarding */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <CharacterSelect onSelect={(id) => { selectCharacter(id); navigate('/chat'); }} />
              </ProtectedRoute>
            }
          />

          {/* Chat */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <CharacterGate>
                  <ChatInterface characterId={selectedCharacterId!} />
                </CharacterGate>
              </ProtectedRoute>
            }
          />

          {/* Feed */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <CharacterGate>
                  <LifestyleFeed />
                </CharacterGate>
              </ProtectedRoute>
            }
          />

          {/* Journal */}
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <CharacterGate>
                  {character && (
                    <JournalPage
                      characterId={selectedCharacterId!}
                      characterColor={character.color}
                      characterName={character.name}
                    />
                  )}
                </CharacterGate>
              </ProtectedRoute>
            }
          />

          {/* Voice Call */}
          <Route
            path="/call"
            element={
              <ProtectedRoute>
                <CharacterGate>
                  {character && (
                    <VoiceCallScreen
                      characterId={selectedCharacterId!}
                      characterName={character.name}
                      characterColor={character.color}
                      onEnd={() => window.history.back()}
                    />
                  )}
                </CharacterGate>
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <CharacterGate>
                  <ProfilePage />
                </CharacterGate>
              </ProtectedRoute>
            }
          />

          {/* Deep Profile — what character knows about you */}
          <Route
            path="/deep-profile"
            element={
              <ProtectedRoute>
                <CharacterGate>
                  <DeepProfilePage />
                </CharacterGate>
              </ProtectedRoute>
            }
          />

          {/* Growth Report */}
          <Route
            path="/growth-report"
            element={
              <ProtectedRoute>
                <CharacterGate>
                  <GrowthReportPage />
                </CharacterGate>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Bottom navigation */}
        <Navigation />
      </div>
    </div>
  );
}
