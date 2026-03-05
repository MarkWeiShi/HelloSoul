import { useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { useEmotionStore } from '../store/emotionStore';
import { streamChatMessage } from '../api/chat';
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
    async (characterId: string, content: string) => {
      if (isStreaming || !content.trim()) return;

      // Add user message
      const userMsg: Message = {
        id: uuid(),
        type: 'text',
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        characterId,
      };
      addMessage(userMsg);

      // Start streaming
      setStreaming(true);
      setStreamingContent('');

      try {
        const metadata = await streamChatMessage(
          characterId,
          content.trim(),
          (delta) => appendStreamingContent(delta)
        );

        // Create AI message from streamed content
        const finalContent = useChatStore.getState().streamingContent;
        const aiMsg: Message = {
          id: metadata.messageId || uuid(),
          type: 'text',
          role: 'ai',
          content: finalContent,
          timestamp: new Date(),
          characterId,
          emotionState: metadata.emotionState,
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

        // Update emotion & scene state
        if (metadata.emotionState) {
          setEmotion(metadata.emotionState);
        }
        if (metadata.sceneId) {
          setScene(metadata.sceneId);
        }
      } catch (err) {
        console.error('Chat error:', err);
        addMessage({
          id: uuid(),
          type: 'text',
          role: 'ai',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
          characterId,
        });
      } finally {
        setStreaming(false);
      }
    },
    [isStreaming, addMessage, setStreaming, setStreamingContent, appendStreamingContent]
  );

  return {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    revealInnerVoice,
  };
}
