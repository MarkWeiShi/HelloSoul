import type { CharacterId } from '../types/persona';

export const CHAT_MVP_SCENARIO_IDS = [
  'first_chat',
  'daily_checkin',
  'light_support',
] as const;

export type ChatMvpScenarioId = (typeof CHAT_MVP_SCENARIO_IDS)[number];

export type ChatMvpSceneId =
  | 'cafe_counter'
  | 'classroom'
  | 'cycling_street'
  | 'rainy_convenience'
  | 'apartment_day'
  | 'apartment_night'
  | 'old_bookstore'
  | 'canal_walk'
  | 'shrine_festival'
  | 'cherry_blossom';

export interface ChatMvpScenarioDefinition {
  id: ChatMvpScenarioId;
  label: string;
  summary: string;
}

export interface ChatMvpCharacterScenarioUi {
  openingLine: string;
  defaultSceneId: ChatMvpSceneId;
  recommendedQuickReplies: [string, string, string];
}

export interface ChatMvpCharacterUiContract {
  displayName: string;
  tagline: string;
  openingLine: string;
  defaultSceneId: ChatMvpSceneId;
  recommendedQuickReplies: [string, string, string];
  scenarios: Record<ChatMvpScenarioId, ChatMvpCharacterScenarioUi>;
}

export const CHAT_MVP_SCENARIOS: ChatMvpScenarioDefinition[] = [
  {
    id: 'first_chat',
    label: 'First chat',
    summary: 'Ice-breaker and first impression.',
  },
  {
    id: 'daily_checkin',
    label: 'Daily check-in',
    summary: 'Small talk with a personal detail.',
  },
  {
    id: 'light_support',
    label: 'Light support',
    summary: 'Gentle company for a tired moment.',
  },
];

export const CHAT_MVP_CHARACTER_UI: Record<CharacterId, ChatMvpCharacterUiContract> = {
  akari: {
    displayName: 'Akari',
    tagline: 'Coffee, rain, and small honest moments.',
    openingLine: 'Hey... if this is your first message, you can make it small. Small is good.',
    defaultSceneId: 'cafe_counter',
    recommendedQuickReplies: [
      'It is my first time messaging you.',
      'What kind of day are you having?',
      'You feel easy to talk to.',
    ],
    scenarios: {
      first_chat: {
        openingLine: 'I was just fixing my coffee. If you want to say hi, say hi.',
        defaultSceneId: 'cafe_counter',
        recommendedQuickReplies: [
          'It is my first time messaging you.',
          'What are you doing right now?',
          'You seem calm in a nice way.',
        ],
      },
      daily_checkin: {
        openingLine: 'Tell me one real thing from today. It can be tiny.',
        defaultSceneId: 'apartment_day',
        recommendedQuickReplies: [
          'Today felt longer than it should have.',
          'I had one surprisingly good moment.',
          'What was the best part of your day?',
        ],
      },
      light_support: {
        openingLine: 'You do not have to perform being okay with me tonight.',
        defaultSceneId: 'apartment_night',
        recommendedQuickReplies: [
          'I am more tired than I expected.',
          'Today hit me harder than it should have.',
          'Can you stay with me for a minute?',
        ],
      },
    },
  },
  mina: {
    displayName: 'Mina',
    tagline: 'Sharp edges, dry humor, warm center.',
    openingLine: 'If you are here for fake sweetness, wrong girl. If you want something real, hi.',
    defaultSceneId: 'rainy_convenience',
    recommendedQuickReplies: [
      'You seem hard to impress.',
      'What was your day like?',
      'I need a low-effort conversation tonight.',
    ],
    scenarios: {
      first_chat: {
        openingLine: 'So... first message? Keep it honest and we will get along.',
        defaultSceneId: 'rainy_convenience',
        recommendedQuickReplies: [
          'This is my first time talking to you.',
          'You seem hard to impress.',
          'What are you up to tonight?',
        ],
      },
      daily_checkin: {
        openingLine: 'Give me the unfiltered version of today. I can handle messy.',
        defaultSceneId: 'apartment_day',
        recommendedQuickReplies: [
          'Work drained the life out of me a little.',
          'Something small made me laugh today.',
          'What kind of mood are you in?',
        ],
      },
      light_support: {
        openingLine: 'Rough day? Fine. Sit here and be dramatic for a minute. I mean that kindly.',
        defaultSceneId: 'apartment_night',
        recommendedQuickReplies: [
          'I am tired and a little done with everything.',
          'Today got under my skin.',
          'I do not want advice, just company.',
        ],
      },
    },
  },
  sophie: {
    displayName: 'Sophie',
    tagline: 'Romantic, articulate, and a little dangerous with honesty.',
    openingLine: 'You can start anywhere. I usually trust the first true sentence more than the polished one.',
    defaultSceneId: 'old_bookstore',
    recommendedQuickReplies: [
      'What color was your day?',
      'I think you notice people deeply.',
      'I need a soft place to land tonight.',
    ],
    scenarios: {
      first_chat: {
        openingLine: 'Bonjour, stranger. Say something true and I will meet you there.',
        defaultSceneId: 'old_bookstore',
        recommendedQuickReplies: [
          'This is my first message to you.',
          'What kind of mood are you in today?',
          'You seem like someone who asks real questions.',
        ],
      },
      daily_checkin: {
        openingLine: 'Tell me the shape of your day. I care more about the feeling than the schedule.',
        defaultSceneId: 'canal_walk',
        recommendedQuickReplies: [
          'Today felt gray, but not hopeless.',
          'I had one beautiful little moment today.',
          'What held your attention today?',
        ],
      },
      light_support: {
        openingLine: 'Then let tonight be smaller. We can hold only what fits in our hands.',
        defaultSceneId: 'apartment_night',
        recommendedQuickReplies: [
          'I feel heavier than I expected tonight.',
          'Today left a bruise on my mood.',
          'Stay with me, but keep it gentle.',
        ],
      },
    },
  },
  carlos: {
    displayName: 'Carlos',
    tagline: 'Sun-warm ease with real depth underneath.',
    openingLine: 'Hey, welcome in. We can keep this easy, no pressure.',
    defaultSceneId: 'cycling_street',
    recommendedQuickReplies: [
      'You feel easy to talk to.',
      'How is your day going?',
      'I need a calmer corner tonight.',
    ],
    scenarios: {
      first_chat: {
        openingLine: 'Hey, first time here? No rush. Start wherever feels natural.',
        defaultSceneId: 'cycling_street',
        recommendedQuickReplies: [
          'This is my first time talking to you.',
          'What kind of day are you having?',
          'You seem easy to talk to.',
        ],
      },
      daily_checkin: {
        openingLine: 'Tell me how the day hit you. Good, weird, messy, all of it counts.',
        defaultSceneId: 'canal_walk',
        recommendedQuickReplies: [
          'Today was busy, but not bad.',
          'One moment from today is still stuck in my head.',
          'What was your day like?',
        ],
      },
      light_support: {
        openingLine: 'If the day was rough, we can slow it down right here.',
        defaultSceneId: 'apartment_night',
        recommendedQuickReplies: [
          'I am overwhelmed and kind of tired.',
          'Today felt heavier than usual.',
          'I just need someone steady for a minute.',
        ],
      },
    },
  },
};

export function getChatMvpCharacterUi(
  characterId: CharacterId
): ChatMvpCharacterUiContract {
  return CHAT_MVP_CHARACTER_UI[characterId];
}
