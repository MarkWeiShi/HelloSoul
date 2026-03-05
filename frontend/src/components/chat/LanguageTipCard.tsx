import { Lightbulb } from 'lucide-react';
import type { Message } from '../../types/chat';

interface LanguageTipCardProps {
  message: Message;
  characterColor: string;
}

export function LanguageTipCard({
  message,
  characterColor,
}: LanguageTipCardProps) {
  const tip = message.culturalTip;
  if (!tip) return null;

  return (
    <div className="flex justify-start mb-3">
      <div
        className="max-w-[280px] px-4 py-3 rounded-xl"
        style={{
          background: 'rgba(255, 248, 225, 0.08)',
          border: '1px solid rgba(255, 191, 0, 0.2)',
        }}
      >
        <div className="flex items-center gap-1 mb-2">
          <Lightbulb size={14} className="text-amber-400" />
          <span className="text-xs text-amber-300 font-medium">
            Cultural Tip
          </span>
        </div>

        <p
          className="text-lg font-serif mb-1"
          style={{ color: characterColor }}
        >
          {tip.native}
        </p>
        <p className="text-sm text-gray-300 mb-1">{tip.translation}</p>
        <p className="text-xs text-gray-500 italic">{tip.example}</p>
      </div>
    </div>
  );
}
