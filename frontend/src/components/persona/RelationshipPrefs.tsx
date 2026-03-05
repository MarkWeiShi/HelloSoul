import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Heart, BookOpen } from 'lucide-react';
import type { RelationshipPrefs } from '../../types/persona';

interface RelationshipPrefsProps {
  prefs: RelationshipPrefs;
  characterColor: string;
  onSave: (prefs: RelationshipPrefs) => void;
}

export function RelationshipPrefsPanel({
  prefs,
  characterColor,
  onSave,
}: RelationshipPrefsProps) {
  const [local, setLocal] = useState<RelationshipPrefs>(prefs);
  const [dirty, setDirty] = useState(false);

  const update = (key: keyof RelationshipPrefs, value: string) => {
    setLocal((p) => ({ ...p, [key]: value }));
    setDirty(true);
  };

  return (
    <div className="p-4 space-y-5">
      <h3 className="text-sm font-semibold text-white/80">Relationship Preferences</h3>

      {/* Contact Frequency */}
      <Section title="Contact Frequency" icon={<Zap size={14} />}>
        <RadioGroup
          options={['low', 'normal', 'high']}
          labels={['Low', 'Normal', 'High']}
          value={local.contactFreq}
          onChange={(v) => update('contactFreq', v)}
          color={characterColor}
        />
      </Section>

      {/* Teaching Mode */}
      <Section title="Language Teaching" icon={<BookOpen size={14} />}>
        <RadioGroup
          options={['organic', 'active', 'none']}
          labels={['Organic', 'Active (correct me)', 'None']}
          value={local.teachingMode}
          onChange={(v) => update('teachingMode', v)}
          color={characterColor}
        />
      </Section>

      {/* Emotional Depth */}
      <Section title="Emotional Depth" icon={<Heart size={14} />}>
        <RadioGroup
          options={['light', 'medium', 'deep']}
          labels={['Keep it light', 'Medium', 'Deep & vulnerable']}
          value={local.emotionalDepth}
          onChange={(v) => update('emotionalDepth', v)}
          color={characterColor}
        />
      </Section>

      {dirty && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: characterColor }}
          onClick={() => {
            onSave(local);
            setDirty(false);
          }}
        >
          Save Preferences
        </motion.button>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2 text-gray-400">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      {children}
    </div>
  );
}

function RadioGroup({
  options,
  labels,
  value,
  onChange,
  color,
}: {
  options: string[];
  labels: string[];
  value: string;
  onChange: (v: string) => void;
  color: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt, i) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          style={
            value === opt
              ? { backgroundColor: color, color: '#fff' }
              : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }
          }
        >
          {labels[i]}
        </button>
      ))}
    </div>
  );
}
