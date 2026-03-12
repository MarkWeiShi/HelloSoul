import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { E2E_USER } from '../testing/e2eSeed';
import {
  disconnectTestPrisma,
  resetTestState,
  startTestServer,
  stopTestServer,
} from '../testing/testServer';

let server: Server;
let baseUrl = '';

before(async () => {
  const started = await startTestServer();
  server = started.server;
  baseUrl = started.baseUrl;
});

beforeEach(async () => {
  await resetTestState();
});

after(async () => {
  await stopTestServer(server);
  await disconnectTestPrisma();
});

async function readJson(response: any) {
  return response.json() as Promise<any>;
}

async function loginSeedUser(): Promise<string> {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: E2E_USER.email,
      password: E2E_USER.password,
    }),
  });

  assert.equal(response.status, 200);
  const body = await readJson(response);
  assert.equal(typeof body.token, 'string');
  return body.token;
}

async function readSse(response: any): Promise<any[]> {
  const reader = response.body?.getReader();
  assert.ok(reader, 'Expected an SSE response body reader.');

  const decoder = new TextDecoder();
  let buffer = '';
  const events: any[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() || '';

    for (const frame of frames) {
      const payload = frame
        .split('\n')
        .filter((line) => line.startsWith('data: '))
        .map((line) => line.slice(6))
        .join('');
      if (payload) {
        events.push(JSON.parse(payload));
      }
    }
  }

  return events;
}

test('auth routes support register, login, and me', async () => {
  const email = `local-${Date.now()}@hellosoul.local`;

  const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      username: 'local-user',
      password: '123456',
    }),
  });

  assert.equal(registerResponse.status, 201);
  const registerBody = await readJson(registerResponse);
  assert.equal(registerBody.user.email, email);

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: '123456',
    }),
  });

  assert.equal(loginResponse.status, 200);
  const loginBody = await readJson(loginResponse);
  assert.equal(loginBody.user.email, email);

  const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${loginBody.token}`,
    },
  });

  assert.equal(meResponse.status, 200);
  const meBody = await readJson(meResponse);
  assert.equal(meBody.user.email, email);
});

test('relationship preferences update persists for the seeded user', async () => {
  const token = await loginSeedUser();

  const originalResponse = await fetch(`${baseUrl}/api/relationship/akari`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(originalResponse.status, 200);
  const originalBody = await readJson(originalResponse);
  assert.deepEqual(originalBody.prefs, {
    contactFreq: 'normal',
    teachingMode: 'organic',
    emotionalDepth: 'medium',
  });

  const updateResponse = await fetch(`${baseUrl}/api/relationship/akari/prefs`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      contactFreq: 'high',
      teachingMode: 'active',
      emotionalDepth: 'deep',
    }),
  });

  assert.equal(updateResponse.status, 200);
  const updateBody = await readJson(updateResponse);
  assert.deepEqual(updateBody.prefs, {
    contactFreq: 'high',
    teachingMode: 'active',
    emotionalDepth: 'deep',
  });

  const refreshedResponse = await fetch(`${baseUrl}/api/relationship/akari`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const refreshedBody = await readJson(refreshedResponse);
  assert.deepEqual(refreshedBody.prefs, updateBody.prefs);
});

test('voice call start keeps low-intimacy characters locked and allows unlocked ones', async () => {
  const token = await loginSeedUser();

  const lockedResponse = await fetch(`${baseUrl}/api/voice/call/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ characterId: 'akari' }),
  });

  assert.equal(lockedResponse.status, 403);
  const lockedBody = await readJson(lockedResponse);
  assert.match(lockedBody.error, /unlock/i);

  const unlockedResponse = await fetch(`${baseUrl}/api/voice/call/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ characterId: 'carlos' }),
  });

  assert.equal(unlockedResponse.status, 200);
  const unlockedBody = await readJson(unlockedResponse);
  assert.equal(unlockedBody.status, 'connecting');
  assert.equal(unlockedBody.characterId, 'carlos');
});

test('chat route streams delta and done events, then writes first-chat artifacts', async () => {
  const token = await loginSeedUser();

  const chatResponse = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      characterId: 'akari',
      message: 'Rainy cafes still calm me down.',
      scenarioId: 'first_chat',
    }),
  });

  assert.equal(chatResponse.status, 200);
  assert.match(chatResponse.headers.get('content-type') || '', /text\/event-stream/);

  const events = await readSse(chatResponse);
  const deltaEvents = events.filter((event) => event.type === 'delta');
  const doneEvent = events.find((event) => event.type === 'done');

  assert.ok(deltaEvents.length > 0, 'Expected streamed delta events.');
  assert.ok(doneEvent, 'Expected a final done event.');
  assert.match(doneEvent.reply, /I heard you say/);
  assert.equal(doneEvent.emotion.key, 'trust');
  assert.equal(doneEvent.intimacy.newLevel, 1);
  assert.equal(doneEvent.intimacy.levelChanged, true);

  const historyResponse = await fetch(`${baseUrl}/api/chat/history/akari`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(historyResponse.status, 200);
  const historyBody = await readJson(historyResponse);
  assert.equal(historyBody.messages.length, 2);
  assert.equal(historyBody.messages[1].role, 'ai');
  assert.equal(historyBody.messages[1].emotion.key, 'trust');

  const timelineResponse = await fetch(`${baseUrl}/api/memory/timeline/akari`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(timelineResponse.status, 200);
  const timelineBody = await readJson(timelineResponse);
  const titles = timelineBody.entries.map((entry: any) => entry.title);
  assert.ok(titles.includes('First conversation'));
  assert.ok(titles.includes('Warm reached'));
});
