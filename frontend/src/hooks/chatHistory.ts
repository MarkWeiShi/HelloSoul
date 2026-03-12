import type { Message } from '../types/chat';

export function shouldLoadChatHistory(params: {
  historyHydrated: boolean;
  currentMessages: Message[];
}): boolean {
  return !params.historyHydrated;
}

export function mergeChatHistoryMessages(params: {
  currentMessages: Message[];
  historyMessages: Message[];
}): Message[] {
  if (params.currentMessages.length === 0) {
    return params.historyMessages;
  }

  const currentById = new Map(
    params.currentMessages.map((message) => [message.id, message])
  );
  const historyIds = new Set(params.historyMessages.map((message) => message.id));

  const mergedHistory = params.historyMessages.map((message) => {
    const localMessage = currentById.get(message.id);
    return localMessage ? { ...message, ...localMessage } : message;
  });

  const localOnlyMessages = params.currentMessages
    .filter((message) => !historyIds.has(message.id))
    .sort((left, right) => left.timestamp.getTime() - right.timestamp.getTime());

  return [...mergedHistory, ...localOnlyMessages];
}
