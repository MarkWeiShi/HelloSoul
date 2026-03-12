import { useCallback, useState } from 'react';
import type { ChatMvpScenarioId } from '../config/privateChatMvp';
import { apiGetChatHistory, streamChatMessage } from '../api/chat';
import { useEmotionStore } from '../store/emotionStore';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../types/chat';
import { INTIMACY_LEVELS } from '../types/persona';
import { usePersonaStore } from '../store/personaStore';
import { v4 as uuid } from 'uuid';
import {
  mergeChatHistoryMessages,
  shouldLoadChatHistory,
} from './chatHistory';

export function useChat() {
  const [historyLoading, setHistoryLoading] = useState(false);
  const {
    messages,
    isStreaming,
    streamingContent,
    setMessages,
    addMessage,
    setStreaming,
    setStreamingContent,
    appendStreamingContent,
    revealInnerVoice,
  } = useChatStore();

  const { setEmotion, setScene } = useEmotionStore();
  const setRelationship = usePersonaStore((state) => state.setRelationship);

  const loadHistory = useCallback(
    async (characterId: string) => {
      const requestCharacterId = characterId;
      const currentStore = useChatStore.getState();
      if (
        !shouldLoadChatHistory({
          historyHydrated: currentStore.historyHydrated,
          currentMessages: currentStore.messages,
        })
      ) {
        return;
      }

      setHistoryLoading(true);

      try {
        const data = await apiGetChatHistory(characterId);

        const latestStore = useChatStore.getState();
        if (latestStore.currentCharacterId !== requestCharacterId) {
          return;
        }

        const hydratedMessages: Message[] = data.messages.map((message) => ({
          ...message,
          timestamp: new Date(message.timestamp),
          memoryRef: message.memoryRef
            ? {
                date: new Date(message.memoryRef.date),
                originalContext: message.memoryRef.originalContext,
              }
            : undefined,
        }));

        const mergedMessages = mergeChatHistoryMessages({
          currentMessages: latestStore.messages,
          historyMessages: hydratedMessages,
        });

        setMessages(mergedMessages);

        const latestAiMessage = [...mergedMessages]
          .reverse()
          .find((message) => message.role === 'ai');
        if (latestAiMessage?.emotion) {
          setEmotion(latestAiMessage.emotion);
        }
        if (latestAiMessage?.sceneId) {
          setScene(latestAiMessage.sceneId);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        if (useChatStore.getState().currentCharacterId === requestCharacterId) {
          setHistoryLoading(false);
        }
      }
    },
    [setEmotion, setMessages, setScene]
  );

  const sendMessage = useCallback(
    async (
      characterId: string,
      content: string,
      scenarioId: ChatMvpScenarioId
    ) => {
      if (historyLoading || isStreaming || !content.trim()) return;

      const requestCharacterId = characterId;
      const userMsg: Message = {
        id: uuid(),
        type: 'text',
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        characterId,
      };
      addMessage(userMsg);

      setStreaming(true);
      setStreamingContent('');

      try {
        const metadata = await streamChatMessage(
          characterId,
          content.trim(),
          scenarioId,
          (delta) => {
            if (useChatStore.getState().currentCharacterId !== requestCharacterId) {
              return;
            }
            appendStreamingContent(delta);
          }
        );

        if (useChatStore.getState().currentCharacterId !== requestCharacterId) {
          return;
        }

        const finalContent =
          metadata.reply || useChatStore.getState().streamingContent;
        const levelLabel =
          INTIMACY_LEVELS.find((level) => level.level === metadata.intimacy.newLevel)?.name ||
          `Level ${metadata.intimacy.newLevel}`;
        const aiMsg: Message = {
          id: metadata.messageId || uuid(),
          type: 'text',
          role: 'ai',
          content: finalContent,
          timestamp: new Date(),
          characterId,
          emotion: metadata.emotion,
          sceneId: metadata.sceneId,
          hasInnerVoice: !!metadata.innerVoice,
          innerVoiceRevealed: false,
          innerVoiceText: metadata.innerVoice?.text,
          innerVoiceLanguage: metadata.innerVoice?.language,
          innerVoiceTranslation: metadata.innerVoice?.translation,
          innerVoiceAudioUrl: metadata.innerVoice?.audioUrl,
          memoryRef: metadata.memoryRecallHit
            ? {
                date: new Date(metadata.memoryRecallHit.date),
                originalContext: metadata.memoryRecallHit.content,
              }
            : undefined,
          relationshipProgress: metadata.intimacy.levelChanged
            ? {
                newLevel: metadata.intimacy.newLevel,
                label: levelLabel,
              }
            : undefined,
        };

        addMessage(aiMsg);
        setStreamingContent('');

        const currentRelationship =
          usePersonaStore.getState().relationships[characterId];
        if (currentRelationship) {
          setRelationship(characterId, {
            ...currentRelationship,
            intimacyScore: metadata.intimacy.newScore,
            intimacyLevel: metadata.intimacy.newLevel,
            totalMessages: currentRelationship.totalMessages + 1,
            lastActiveAt: new Date().toISOString(),
          });
        }

        if (metadata.emotion) {
          setEmotion(metadata.emotion);
        }
        if (metadata.sceneId) {
          setScene(metadata.sceneId);
        }
      } catch (err) {
        console.error('Chat error:', err);
        if (useChatStore.getState().currentCharacterId !== requestCharacterId) {
          return;
        }
        addMessage({
          id: uuid(),
          type: 'text',
          role: 'ai',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
          characterId,
        });
      } finally {
        if (useChatStore.getState().currentCharacterId === requestCharacterId) {
          setStreaming(false);
        }
      }
    },
    [
      historyLoading,
      isStreaming,
      addMessage,
      appendStreamingContent,
      setRelationship,
      setEmotion,
      setScene,
      setMessages,
      setStreaming,
      setStreamingContent,
    ]
  );

  return {
    messages,
    isStreaming,
    historyLoading,
    streamingContent,
    loadHistory,
    sendMessage,
    revealInnerVoice,
  };
}
