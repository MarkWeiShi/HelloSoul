import prisma from '../lib/prisma';

const LEGACY_EMO_TO_KEY: Record<string, string> = {
  EMO_01: 'contentment',
  EMO_02: 'joy',
  EMO_03: 'affection',
  EMO_04: 'interest',
  EMO_05: 'compassion',
  EMO_06: 'awe',
  EMO_07: 'playfulness',
  EMO_08: 'curiosity',
  EMO_09: 'amusement',
  EMO_10: 'frustration',
  EMO_11: 'elevation',
  EMO_12: 'exhaustion',
  EMO_13: 'triumph',
  EMO_14: 'anticipation',
};

function buildCaseSql(oldColumn: string): string {
  const branches = Object.entries(LEGACY_EMO_TO_KEY)
    .map(([legacy, key]) => `WHEN '${legacy}' THEN '${key}'`)
    .join(' ');

  return `CASE UPPER(TRIM(COALESCE(${oldColumn}, ''))) ${branches} ELSE 'contentment' END`;
}

async function getColumns(tableName: string): Promise<Set<string>> {
  const rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `PRAGMA table_info("${tableName}")`
  );
  return new Set(rows.map((r) => r.name));
}

async function backfillChatMessage() {
  let columns = await getColumns('ChatMessage');
  const hasLegacy = columns.has('emotionState');
  let hasTarget = columns.has('emotionKey');

  if (!hasTarget) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ChatMessage" ADD COLUMN "emotionKey" TEXT`
    );
    hasTarget = true;
    columns = await getColumns('ChatMessage');
    console.log('[backfill] Added ChatMessage.emotionKey column.');
  }

  if (!columns.has('emotionEndKey')) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ChatMessage" ADD COLUMN "emotionEndKey" TEXT`
    );
    console.log('[backfill] Added ChatMessage.emotionEndKey column.');
  }

  if (!hasLegacy) {
    await prisma.$executeRawUnsafe(`
      UPDATE "ChatMessage"
      SET "emotionKey" = COALESCE(NULLIF("emotionKey", ''), 'contentment')
      WHERE "emotionKey" IS NULL OR "emotionKey" = ''
    `);
    console.log('[backfill] ChatMessage legacy column not found; normalized null emotionKey to contentment.');
    return true;
  }

  const caseSql = buildCaseSql('"emotionState"');
  await prisma.$executeRawUnsafe(`
    UPDATE "ChatMessage"
    SET "emotionKey" = ${caseSql}
    WHERE "emotionKey" IS NULL OR "emotionKey" = ''
  `);

  console.log('[backfill] ChatMessage emotionKey backfilled from emotionState.');
  return true;
}

async function backfillProactiveMessage() {
  let columns = await getColumns('ProactiveMessage');
  const hasLegacy = columns.has('emotionState');
  let hasTarget = columns.has('emotionKey');

  if (!hasTarget) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ProactiveMessage" ADD COLUMN "emotionKey" TEXT`
    );
    hasTarget = true;
    columns = await getColumns('ProactiveMessage');
    console.log('[backfill] Added ProactiveMessage.emotionKey column.');
  }

  if (!hasLegacy) {
    await prisma.$executeRawUnsafe(`
      UPDATE "ProactiveMessage"
      SET "emotionKey" = COALESCE(NULLIF("emotionKey", ''), 'contentment')
      WHERE "emotionKey" IS NULL OR "emotionKey" = ''
    `);
    console.log('[backfill] ProactiveMessage legacy column not found; normalized null emotionKey to contentment.');
    return true;
  }

  const caseSql = buildCaseSql('"emotionState"');
  await prisma.$executeRawUnsafe(`
    UPDATE "ProactiveMessage"
    SET "emotionKey" = ${caseSql}
    WHERE "emotionKey" IS NULL OR "emotionKey" = ''
  `);

  console.log('[backfill] ProactiveMessage emotionKey backfilled from emotionState.');
  return true;
}

async function run() {
  const hasChatTarget = await backfillChatMessage();
  const hasProactiveTarget = await backfillProactiveMessage();

  if (hasChatTarget) {
    const [chatCount] = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
      `SELECT COUNT(*) AS count FROM "ChatMessage" WHERE "emotionKey" IS NULL OR "emotionKey" = ''`
    );
    console.log(`[backfill] ChatMessage missing emotionKey: ${chatCount?.count ?? 0}`);
  }

  if (hasProactiveTarget) {
    const [proactiveCount] = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
      `SELECT COUNT(*) AS count FROM "ProactiveMessage" WHERE "emotionKey" IS NULL OR "emotionKey" = ''`
    );
    console.log(`[backfill] ProactiveMessage missing emotionKey: ${proactiveCount?.count ?? 0}`);
  }
}

run()
  .catch((error) => {
    console.error('[backfill] Failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
