import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, CheckCircle } from 'lucide-react';
import { useDeepProfile } from '../../hooks/useDeepProfile';

interface ReflectionQuestionCardProps {
  characterId: string;
  characterName: string;
  characterColor: string;
}

export function ReflectionQuestionCard({
  characterId,
  characterName,
  characterColor,
}: ReflectionQuestionCardProps) {
  const { reflectionQuestion, fetchReflection, answerReflection } =
    useDeepProfile(characterId);
  const [answer, setAnswer] = useState('');
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    fetchReflection();
  }, [fetchReflection]);

  const handleSubmit = async () => {
    if (!answer.trim() || !reflectionQuestion) return;
    await answerReflection(reflectionQuestion.id, answer.trim());
    setAnswered(true);
    setAnswer('');
  };

  if (!reflectionQuestion) return null;

  // Already answered today
  if (reflectionQuestion.answeredAt || answered) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-400" />
          <p className="text-xs text-gray-400">
            Today's reflection answered! {characterName} will remember your thoughts.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div
        className="px-4 pt-4 pb-2"
        style={{
          background: `linear-gradient(135deg, ${characterColor}10, transparent)`,
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles size={14} style={{ color: characterColor }} />
          <span className="text-[10px] font-medium" style={{ color: characterColor }}>
            今日一問 — Daily Reflection
          </span>
        </div>
      </div>

      {/* Opening line from character */}
      {reflectionQuestion.openingLine && (
        <div className="px-4">
          <p className="text-xs text-gray-400 italic">
            "{reflectionQuestion.openingLine}"
          </p>
        </div>
      )}

      {/* Question */}
      <div className="p-4">
        <p className="text-sm text-white/90 font-medium">
          {reflectionQuestion.question}
        </p>
      </div>

      {/* Answer input */}
      <div className="px-4 pb-4">
        <div className="flex items-end gap-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your thoughts..."
            className="flex-1 bg-white/5 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 outline-none resize-none min-h-[60px] max-h-[120px] border border-white/5 focus:border-white/10 transition"
            rows={2}
          />
          <button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="p-2 rounded-full transition-colors disabled:opacity-30"
            style={{ color: characterColor }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
