import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Sparkles, BookOpen, User } from 'lucide-react';
import { usePersonaStore } from '../../store/personaStore';

const NAV_ITEMS = [
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/feed', icon: Sparkles, label: 'Feed' },
  { path: '/journal', icon: BookOpen, label: 'Journal' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCharacterId, getCharacter } = usePersonaStore();
  const character = selectedCharacterId ? getCharacter(selectedCharacterId) : null;
  const color = character?.color || '#888';

  // Hide nav on certain screens
  const hiddenPaths = ['/onboarding', '/call', '/login', '/register', '/deep-profile', '/growth-report'];
  if (hiddenPaths.some((p) => location.pathname.startsWith(p))) return null;

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 bg-[#0F0B1E]/90 backdrop-blur-lg border-t border-white/5">
      <div className="flex items-center justify-around py-2 pb-6">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 min-w-[56px] transition-all"
            >
              <Icon
                size={22}
                style={active ? { color } : undefined}
                className={active ? '' : 'text-gray-600'}
              />
              <span
                className="text-[10px]"
                style={active ? { color } : { color: 'rgb(75,85,99)' }}
              >
                {label}
              </span>
              {active && (
                <div
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{ backgroundColor: color }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
