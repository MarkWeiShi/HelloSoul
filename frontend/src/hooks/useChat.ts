import { useCallback } from 'react';
import type { ChatMvpScenarioId } from '../config/privateChatMvp';
import { streamChatMessage } from '../api/chat';
import { useEmotionStore } from '../store/emotionStore';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../types/chat';
import { v4 as uuid } from 'uuid';

export function useChat() {
  const {
    messages,
    isStreaming,
    streamingContent,
    addMessage,
    setStreaming,
    setStreamingContent,
    appendStreamingContent,
    revealInnerVoice,
  } = useChatStore();

  const { setEmotion, setScene } = useEmotionStore();

  const sendMessage = useCallback(
    async (
      characterId: string,
      content: string,
      scenarioId: ChatMvpScenarioId
    ) => {
      if (isStreaming || !content.trim()) return;

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

        const finalContent = useChatStore.getState().streamingContent;
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
          memoryRef: metadata.memoryRecall
            ? {
                date: new Date(metadata.memoryRecall.date),
                originalContext: metadata.memoryRecall.content,
              }
            : undefined,
        };

        addMessage(aiMsg);
        setStreamingContent('');

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
      isStreaming,
      addMessage,
      appendStreamingContent,
      setEmotion,
      setScene,
      setStreaming,
      setStreamingContent,
    ]
  );

  return {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    revealInnerVoice,
  };
}
