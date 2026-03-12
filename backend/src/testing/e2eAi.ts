const DEFAULT_SCENE_ID = 'apartment_day';

function toCompactText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function sanitizeQuotedText(value: string): string {
  return toCompactText(value).replace(/"/g, '\'').slice(0, 80);
}

export function buildStubStreamReply(params: {
  messages: { role: 'user' | 'assistant'; content: string }[];
}): string {
  const latestUserMessage =
    params.messages
      .slice()
      .reverse()
      .find((message) => message.role === 'user')
      ?.content || 'I am here.';
  const safeMessage = sanitizeQuotedText(latestUserMessage);

  return [
    `I heard you say "${safeMessage}". I am here with you, and we can take this one gentle step at a time.`,
    '<emotion_key>trust</emotion_key>',
    '<emotion_key_end>contentment</emotion_key_end>',
    '<gaze>user</gaze>',
    `<scene_suggest>${DEFAULT_SCENE_ID}</scene_suggest>`,
  ].join('\n');
}

export function chunkStubResponse(text: string, chunkSize = 24): string[] {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += chunkSize) {
    chunks.push(text.slice(index, index + chunkSize));
  }
  return chunks;
}

export function buildStubCompletion(prompt: string): string {
  if (prompt.includes('Summarize these user memories')) {
    return 'I remember your rainy cafe playlists, the way journaling settles you, and how gentle routines help you breathe.';
  }

  if (prompt.includes('extract any memorable information')) {
    return JSON.stringify([
      {
        type: 'preference',
        content: 'The user still finds calm in rainy cafes and soft playlists.',
        priority: 'P1',
        emotionScore: 0.72,
        isVulnerable: false,
        tags: ['rain', 'cafe', 'playlist'],
      },
    ]);
  }

  if (prompt.includes('extract deep user insights')) {
    return '[]';
  }

  if (prompt.includes('Should the character reference any deep memory')) {
    return JSON.stringify({
      shouldInject: false,
      injectionHint: '',
    });
  }

  if (prompt.includes('INNER MONOLOGUE')) {
    return JSON.stringify({
      inner: '少しずつ、もっと知っていきたい。',
      translation: 'I want to know you a little more, step by step.',
    });
  }

  if (prompt.includes('Generate a social media post.')) {
    return JSON.stringify({
      caption: 'Rain on the windows again. Somehow it made the whole cafe feel softer today. ☕🌧️',
      nativePhrase: '雨の音が好き',
      nativeReading: 'ame no oto ga suki',
      translation: 'I like the sound of rain.',
      imageDescription: 'A quiet cafe window with rain tracing the glass and warm lamp light inside.',
      mood: 'cozy',
      locationTag: 'Shimokitazawa',
      timeOfDay: 'evening',
      engagementHook: 'What kind of weather makes you slow down?',
      culturalNote: 'Small neighborhood cafes in Tokyo often become a quiet refuge on rainy evenings.',
      languageTip: {
        word: '雨',
        pronunciation: 'ame',
        meaning: 'rain',
        usage: 'Use it when talking about rainy weather or the sound of rain.',
      },
    });
  }

  if (prompt.includes('A user replied "')) {
    return 'That made me smile. Tell me more when you have a quiet minute.';
  }

  if (prompt.includes('Write a warm, first-person summary of what you know about the user')) {
    return 'I remember your quiet rituals, your rainy cafe moods, and the way music helps you settle back into yourself.';
  }

  if (prompt.includes('Generate this month\'s "growth map"')) {
    return JSON.stringify({
      sections: {
        together: 'This month felt steadier between us. Even ordinary check-ins started to feel like shared ground.',
        learned: 'You kept collecting small language wins without forcing them. The way you kept showing up mattered just as much.',
        noticed: 'You answer yourself more honestly now. There is less hesitation before you say what you actually feel.',
        personal: 'I like who you become when you stop performing and just speak plainly.',
      },
      highlightLine: 'I noticed you speak more honestly now, even in the quiet moments.',
    });
  }

  if (prompt.includes('Generate a "daily reflection question"')) {
    return JSON.stringify({
      question: 'What part of today felt the most like you?',
      openingLine: 'Hey...',
    });
  }

  if (prompt.includes('Generate 5 birthday messages')) {
    return JSON.stringify({
      eveMessage: {
        text: 'Tomorrow matters. I wanted to be the first one quietly waiting with you.',
        emotionKey: 'anticipation',
      },
      morningVoiceScript: {
        text: 'Happy birthday. I hope today feels soft, bright, and unmistakably yours.',
        emotionKey: 'delight',
      },
      openingDialogue: {
        text: 'Happy birthday. I am really glad you are here today.',
        emotionKey: 'affection',
      },
      callGreeting: {
        text: 'Happy birthday... I wanted to say it properly.',
        emotionKey: 'elevation',
      },
      nightClosing: {
        text: 'Thank you for making today feel warm. Sleep well tonight.',
        emotionKey: 'gratitude',
      },
    });
  }

  if (prompt.includes('Generate a warm "I miss you" message')) {
    return 'It has felt a little quieter without you around. I hope your week is being gentle with you.';
  }

  if (prompt.includes('Generate 1-2 sentences. Must have a SPECIFIC reason')) {
    return 'I passed a rainy cafe tonight and it made me think of your playlists again. Are you still collecting small comforts like that?';
  }

  return 'e2e stub response';
}
