import prisma from '../lib/prisma';
import { completeHaiku } from './claudeService';

// ===== Module A: Ambassador Content Service =====
// Process real cultural ambassador media into character-voiced feed posts

interface MediaSubmission {
  ambassadorId: string;
  characterId: string;
  mediaUrl?: string;
  rawDescription: string;
  ambassadorNote?: string;
  tags: {
    location?: string;
    timeOfDay?: string;
    weather?: string;
    mood?: string;
  };
}

const CHARACTER_VOICE: Record<string, { lang: string; style: string; forbidden: string }> = {
  akari: {
    lang: 'Japanese/English mix',
    style: '温柔细腻，用细节说话，喜欢用なんか/そうだね',
    forbidden: '不说「今天好开心」这种空泛句，必须有具体细节',
  },
  mina: {
    lang: 'Korean/English mix',
    style: '随性酷感，偶尔韩语，有点都市感的疲惫',
    forbidden: '不过分甜，不煽情',
  },
  sophie: {
    lang: 'French/English mix',
    style: '诗意的观察，冷静但温暖，偶尔法语',
    forbidden: '不说教，不空洞哲理',
  },
  carlos: {
    lang: 'Portuguese/English mix',
    style: '温暖随性，用比喻，海洋意象',
    forbidden: '不刻意正能量，不说空话',
  },
};

/**
 * Generate a feed post from ambassador-submitted real media.
 */
export async function generatePostFromAmbassadorMedia(
  submission: MediaSubmission
): Promise<{
  caption: string;
  nativePhrase: string;
  translation: string;
  culturalHook: string;
  imageDescription: string;
  replyPrompt: string | null;
}> {
  const voice = CHARACTER_VOICE[submission.characterId] || CHARACTER_VOICE.akari;

  const result = await completeHaiku(
    `You are ${submission.characterId}, writing a lifestyle post based on real ambassador content.

Real content source:
- Location: ${submission.tags.location || 'unspecified'}
- Time: ${submission.tags.timeOfDay || 'afternoon'}
- Scene: ${submission.rawDescription}
- Ambassador feeling: ${submission.ambassadorNote || 'none provided'}

Character voice: ${voice.style}
Language: ${voice.lang}
Forbidden: ${voice.forbidden}

Generate (JSON, no markdown):
{
  "caption": "Post text (50-120 chars, character voice, mixed language)",
  "nativePhrase": "Core target-language phrase from the post",
  "translation": "Translation of that phrase",
  "culturalHook": "Cultural learning point embedded in this post",
  "imageDescription": "If AI image needed, describe style (real photography feel, no faces)",
  "replyPrompt": "Question character wants user to answer (or null, 40% of posts have one)"
}

Return ONLY the JSON.`,
    400
  );

  try {
    return JSON.parse(result);
  } catch {
    return {
      caption: `Just noticed something at ${submission.tags.location || 'a quiet spot'}...`,
      nativePhrase: '',
      translation: '',
      culturalHook: '',
      imageDescription: submission.rawDescription,
      replyPrompt: null,
    };
  }
}

/**
 * Submit ambassador media for processing.
 */
export async function submitAmbassadorMedia(
  submission: MediaSubmission
): Promise<string> {
  const entry = await prisma.ambassadorSubmission.create({
    data: {
      ambassadorId: submission.ambassadorId,
      characterId: submission.characterId,
      mediaUrl: submission.mediaUrl,
      rawDescription: submission.rawDescription,
      ambassadorNote: submission.ambassadorNote,
      tags: JSON.stringify(submission.tags),
      status: 'pending',
    },
  });

  return entry.id;
}

/**
 * Process an approved ambassador submission into a feed post.
 */
export async function processApprovedSubmission(
  submissionId: string
): Promise<string | null> {
  const submission = await prisma.ambassadorSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission || submission.status !== 'approved') return null;

  const tags = JSON.parse(submission.tags || '{}');

  const postData = await generatePostFromAmbassadorMedia({
    ambassadorId: submission.ambassadorId,
    characterId: submission.characterId,
    mediaUrl: submission.mediaUrl || undefined,
    rawDescription: submission.rawDescription,
    ambassadorNote: submission.ambassadorNote || undefined,
    tags,
  });

  // Create the feed post
  const post = await prisma.lifestyleFeedPost.create({
    data: {
      characterId: submission.characterId,
      type: 'life_moment',
      content: JSON.stringify({
        ...postData,
        source: 'ambassador',
        ambassadorSubmissionId: submissionId,
        mediaUrl: submission.mediaUrl,
      }),
      imageUrl: submission.mediaUrl,
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  // Update submission status
  await prisma.ambassadorSubmission.update({
    where: { id: submissionId },
    data: {
      status: 'published',
      processedPostId: post.id,
      reviewedAt: new Date(),
    },
  });

  return post.id;
}

/**
 * Get ambassador submissions for review (admin/ops dashboard).
 */
export async function getSubmissionsForReview(characterId?: string) {
  return prisma.ambassadorSubmission.findMany({
    where: {
      status: 'pending',
      ...(characterId ? { characterId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
