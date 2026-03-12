import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSseDataFrames } from './chatStream';

test('extractSseDataFrames buffers incomplete SSE frames across chunks', () => {
  const first = extractSseDataFrames('data: {"type":"delta","content":"Hel');
  assert.deepEqual(first.events, []);
  assert.equal(first.rest, 'data: {"type":"delta","content":"Hel');

  const second = extractSseDataFrames(
    `${first.rest}lo"}\n\ndata: {"type":"done","reply":"Hi"}\n\n`
  );

  assert.deepEqual(second.events, [
    '{"type":"delta","content":"Hello"}',
    '{"type":"done","reply":"Hi"}',
  ]);
  assert.equal(second.rest, '');
});
