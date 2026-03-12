export function extractSseDataFrames(buffer: string): {
  events: string[];
  rest: string;
} {
  const frames = buffer.split('\n\n');
  const rest = frames.pop() || '';
  const events = frames
    .map((frame) =>
      frame
        .split('\n')
        .filter((line) => line.startsWith('data: '))
        .map((line) => line.slice(6))
        .join('')
    )
    .filter(Boolean);

  return { events, rest };
}
