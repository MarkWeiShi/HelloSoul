import test from 'node:test';
import assert from 'node:assert/strict';

class MemoryStorage {
  private storage = new Map<string, string>();

  getItem(key: string) {
    return this.storage.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.storage.set(key, value);
  }

  removeItem(key: string) {
    this.storage.delete(key);
  }

  clear() {
    this.storage.clear();
  }
}

test('streamChatMessage flushes decoder tail before parsing the final SSE frame', async () => {
  const originalLocalStorage = globalThis.localStorage;
  const originalFetch = globalThis.fetch;
  const OriginalTextDecoder = globalThis.TextDecoder;

  try {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: new MemoryStorage(),
    });

    let decodeCalls = 0;
    class FakeTextDecoder {
      decode(_value?: BufferSource, options?: { stream?: boolean }) {
        decodeCalls += 1;
        if (options?.stream) {
          return decodeCalls === 1
            ? 'data: {"type":"delta","content":"Hel'
            : '';
        }

        return 'lo"}\n\ndata: {"type":"done","messageId":"msg_1","reply":"Hello","intimacy":{"newScore":1,"newLevel":0,"levelChanged":false},"innerVoice":null,"memoryRecallHit":null,"promptVersion":"chat-v2-structured","warnings":[],"traceId":"trace_1"}\n\n';
      }
    }

    Object.defineProperty(globalThis, 'TextDecoder', {
      configurable: true,
      value: FakeTextDecoder,
    });

    globalThis.fetch = async () =>
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array([1]));
            controller.close();
          },
        }),
        { status: 200 }
      );

    const { streamChatMessage } = await import('./chat');
    const deltas: string[] = [];

    const metadata = await streamChatMessage('akari', 'hello', 'first_chat', (delta) => {
      deltas.push(delta);
    });

    assert.deepEqual(deltas, ['Hello']);
    assert.equal(metadata.reply, 'Hello');
    assert.equal(metadata.messageId, 'msg_1');
  } finally {
    globalThis.fetch = originalFetch;
    Object.defineProperty(globalThis, 'TextDecoder', {
      configurable: true,
      value: OriginalTextDecoder,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
  }
});
