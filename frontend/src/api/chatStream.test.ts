import { describe, expect, it } from 'vitest';
import { extractSseDataFrames } from './chatStream';

describe('extractSseDataFrames', () => {
  it('buffers incomplete SSE frames across chunks', () => {
    const first = extractSseDataFrames('data: {"type":"delta","content":"Hel');
    expect(first.events).toEqual([]);
    expect(first.rest).toBe('data: {"type":"delta","content":"Hel');

    const second = extractSseDataFrames(
      `${first.rest}lo"}\n\ndata: {"type":"done","reply":"Hi"}\n\n`
    );

    expect(second.events).toEqual([
      '{"type":"delta","content":"Hello"}',
      '{"type":"done","reply":"Hi"}',
    ]);
    expect(second.rest).toBe('');
  });
});
