import { motion } from 'framer-motion';

interface CharacterAvatarProps {
  name: string;
  flag: string;
  accentColor: string;
  size?: 'sm' | 'md' | 'lg';
  breathing?: boolean;
}

const SIZES = {
  sm: { outer: 'w-8 h-8', text: 'text-sm' },
  md: { outer: 'w-12 h-12', text: 'text-lg' },
  lg: { outer: 'w-20 h-20', text: 'text-2xl' },
};

export function CharacterAvatar({
  name,
  flag,
  accentColor,
  size = 'md',
  breathing = true,
}: CharacterAvatarProps) {
  const s = SIZES[size];

  const inner = (
    <div
      className={`${s.outer} rounded-full flex items-center justify-center ${s.text}`}
      style={{ backgroundColor: `${accentColor}20` }}
    >
      {flag}
    </div>
  );

  if (!breathing) return inner;

  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {inner}
    </motion.div>
  );
}
