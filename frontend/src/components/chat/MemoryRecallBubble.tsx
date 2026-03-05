import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { Message } from '../../types/chat';

interface MemoryRecallBubbleProps {
  message: Message;
  characterColor: string;
}

export function MemoryRecallBubble({
  message,
  characterColor,
}: MemoryRecallBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-3"
    >
      <div
        className="max-w-[75%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm"
        style={{
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 0 12px rgba(139, 92, 246, 0.15)',
        }}
      >
        {/* Memory label */}
        <div className="flex items-center gap-1 mb-1">
          <Sparkles size={12} className="text-purple-400" />
          <span className="text-[10px] text-purple-300">
            Remembered from{' '}
            {message.memoryRef?.date
              ? new Date(message.memoryRef.date).toLocaleDateString()
              : 'before'}
          </span>
        </div>

        <p className="text-white/90 whitespace-pre-wrap">{message.content}</p>
      </div>
    </motion.div>
  );
}
