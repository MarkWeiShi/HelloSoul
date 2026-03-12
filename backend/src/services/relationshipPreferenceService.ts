export interface RelationshipPreferenceSnapshot {
  contactFreq?: 'low' | 'normal' | 'high' | string | null;
  teachingMode?: 'organic' | 'active' | 'none' | string | null;
  emotionalDepth?: 'light' | 'medium' | 'deep' | string | null;
}

function normalizeContactFreq(value?: string | null): 'low' | 'normal' | 'high' {
  if (value === 'low' || value === 'high') return value;
  return 'normal';
}

function normalizeTeachingMode(
  value?: string | null
): 'organic' | 'active' | 'none' {
  if (value === 'active' || value === 'none') return value;
  return 'organic';
}

function normalizeEmotionalDepth(
  value?: string | null
): 'light' | 'medium' | 'deep' {
  if (value === 'light' || value === 'deep') return value;
  return 'medium';
}

export function getProactiveCadenceHours(
  contactFreq?: string | null
): number {
  switch (normalizeContactFreq(contactFreq)) {
    case 'low':
      return 72;
    case 'high':
      return 24;
    default:
      return 48;
  }
}

export function getEarliestProactiveSendAt(params: {
  now: Date;
  lastProactiveAt?: Date | null;
  contactFreq?: string | null;
}): Date {
  if (!params.lastProactiveAt) {
    return new Date(params.now);
  }

  const earliest = new Date(params.lastProactiveAt);
  earliest.setHours(
    earliest.getHours() + getProactiveCadenceHours(params.contactFreq)
  );

  return earliest > params.now ? earliest : new Date(params.now);
}

export function moveDateOutOfSilentHours(
  target: Date,
  silentHoursStart?: number | null,
  silentHoursEnd?: number | null
): Date {
  const adjusted = new Date(target);

  if (
    silentHoursStart === null ||
    silentHoursStart === undefined ||
    silentHoursEnd === null ||
    silentHoursEnd === undefined
  ) {
    return adjusted;
  }

  const hour = adjusted.getHours();
  const start = silentHoursStart;
  const end = silentHoursEnd;
  const inSilentWindow =
    start < end
      ? hour >= start && hour < end
      : hour >= start || hour < end;

  if (!inSilentWindow) {
    return adjusted;
  }

  adjusted.setHours(end, 10, 0, 0);
  if (adjusted <= target) {
    adjusted.setDate(adjusted.getDate() + 1);
  }

  return adjusted;
}

export function buildRelationshipPreferenceContext(
  prefs: RelationshipPreferenceSnapshot
): string {
  const contactFreq = normalizeContactFreq(prefs.contactFreq);
  const teachingMode = normalizeTeachingMode(prefs.teachingMode);
  const emotionalDepth = normalizeEmotionalDepth(prefs.emotionalDepth);

  const lines = [
    '=== USER RELATIONSHIP PREFERENCES ===',
    '- Always match the user\'s preferred pace and never act clingier than requested.',
  ];

  if (contactFreq === 'low') {
    lines.push('- Keep the thread calm and spacious. Avoid stacking questions or chasing extra reassurance.');
  } else if (contactFreq === 'high') {
    lines.push('- The user welcomes a warmer pace. It is okay to sound a little more present and responsive.');
  } else {
    lines.push('- Keep a balanced rhythm: present, but never overbearing.');
  }

  if (teachingMode === 'active') {
    lines.push('- The user wants gentle learning help: gently correct small mistakes and offer one natural phrase when useful.');
  } else if (teachingMode === 'none') {
    lines.push('- Avoid unsolicited language teaching unless the user directly asks for help.');
  } else {
    lines.push('- Keep language teaching organic. Share phrases only when they naturally fit the moment.');
  }

  if (emotionalDepth === 'light') {
    lines.push('- Keep emotional intensity light. Comfort them, but do not push for deep disclosure.');
  } else if (emotionalDepth === 'deep') {
    lines.push('- The user is open to deeper emotional honesty when the moment is earned.');
  } else {
    lines.push('- Stay emotionally warm and attentive without forcing vulnerability.');
  }

  return lines.join('\n');
}

export function buildProactivePreferenceContext(
  prefs: RelationshipPreferenceSnapshot
): string {
  const contactFreq = normalizeContactFreq(prefs.contactFreq);
  const teachingMode = normalizeTeachingMode(prefs.teachingMode);
  const emotionalDepth = normalizeEmotionalDepth(prefs.emotionalDepth);

  const lines = [
    '=== PROACTIVE MESSAGE PREFERENCES ===',
  ];

  if (contactFreq === 'low') {
    lines.push('- Keep outreach sparse. One clear reason is better than frequent check-ins.');
  } else if (contactFreq === 'high') {
    lines.push('- A slightly more frequent presence is welcome, but every message still needs a concrete reason.');
  } else {
    lines.push('- Keep outreach moderate and earned by context.');
  }

  if (teachingMode === 'none') {
    lines.push('- Avoid unsolicited language teaching or vocabulary quizzes.');
  } else if (teachingMode === 'active') {
    lines.push('- If a phrase appears naturally, it is okay to include a small teachable moment.');
  } else {
    lines.push('- Keep any language flavor incidental, never instructional.');
  }

  if (emotionalDepth === 'light') {
    lines.push('- Keep the emotional ask light and easy to ignore without guilt.');
  } else if (emotionalDepth === 'deep') {
    lines.push('- Emotional follow-ups can be a little more intimate when there is real context.');
  } else {
    lines.push('- Aim for warm but low-pressure emotional contact.');
  }

  return lines.join('\n');
}
