import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

interface VocabStickersProps {
  characterId: string;
  characterColor: string;
}

// Static sample vocab — in a real app this comes from memory API
const SAMPLE_VOCAB: Record<
  string,
  { word: string; translation: string; romanization?: string }[]
> = {
  akari: [
    { word: 'おはよう', translation: 'Good morning', romanization: 'ohayou' },
    { word: 'ありがとう', translation: 'Thank you', romanization: 'arigatou' },
    { word: '好き', translation: 'Like / Love', romanization: 'suki' },
    { word: 'かわいい', translation: 'Cute', romanization: 'kawaii' },
    { word: '頑張って', translation: 'Do your best', romanization: 'ganbatte' },
    { word: '大丈夫', translation: "It's okay", romanization: 'daijoubu' },
  ],
  mina: [
    { word: '안녕하세요', translation: 'Hello', romanization: 'annyeonghaseyo' },
    { word: '감사합니다', translation: 'Thank you', romanization: 'gamsahamnida' },
    { word: '사랑해', translation: 'I love you', romanization: 'saranghae' },
    { word: '화이팅', translation: 'Fighting!', romanization: 'hwaiting' },
    { word: '멋있어', translation: 'Cool / Awesome', romanization: 'meossisseo' },
  ],
  sophie: [
    { word: 'Bonjour', translation: 'Hello' },
    { word: 'Merci', translation: 'Thank you' },
    { word: "Je t'aime", translation: 'I love you' },
    { word: 'C\'est la vie', translation: 'That\'s life' },
    { word: 'Bisou', translation: 'Kiss' },
  ],
  carlos: [
    { word: 'Oi', translation: 'Hi' },
    { word: 'Obrigado', translation: 'Thank you' },
    { word: 'Saudade', translation: 'Longing / Missing' },
    { word: 'Te amo', translation: 'I love you' },
    { word: 'Tudo bem?', translation: 'How are you?' },
  ],
};

export function VocabStickers({
  characterId,
  characterColor,
}: VocabStickersProps) {
  const vocab = SAMPLE_VOCAB[characterId] || [];

  return (
    <div className="px-4">
      <h3 className="text-sm font-medium text-white/70 mb-3">
        Words You've Learned
      </h3>

      {vocab.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-6">
          No vocabulary yet — keep chatting!
        </p>
      ) : (
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-3 w-max">
            {vocab.map((v, i) => (
              <motion.div
                key={v.word}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="w-36 shrink-0 rounded-xl p-3 border"
                style={{
                  borderColor: `${characterColor}30`,
                  backgroundColor: `${characterColor}10`,
                }}
              >
                <div className="text-lg font-serif text-white mb-1">{v.word}</div>
                {v.romanization && (
                  <div className="text-[10px] text-gray-500 mb-1">
                    {v.romanization}
                  </div>
                )}
                <div className="text-xs text-gray-400">{v.translation}</div>
                <button
                  className="mt-2 flex items-center gap-1 text-[10px]"
                  style={{ color: characterColor }}
                >
                  <Volume2 size={10} />
                  Listen
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
