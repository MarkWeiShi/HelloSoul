import { useCallback, useState } from 'react';
import { apiGenerateVoice, apiStartVoiceCall } from '../api/voice';
import { speak, stopSpeaking, isSpeaking as checkSpeaking, isTTSAvailable } from '../utils/tts';

export function useVoice() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [cancelTTS, setCancelTTS] = useState<(() => void) | null>(null);

  /**
   * Play a voice message using Web Speech API (free & instant).
   * Falls back to ElevenLabs backend API if Web Speech is unavailable.
   */
  const playVoice = useCallback(
    async (characterId: string, text: string) => {
      // Toggle off if already playing
      if (isPlaying) {
        stopSpeaking();
        if (currentAudio) currentAudio.pause();
        if (cancelTTS) cancelTTS();
        setIsPlaying(false);
        setCancelTTS(null);
        return;
      }

      // Try Web Speech API first (free & instant)
      if (isTTSAvailable()) {
        setIsPlaying(true);
        const cancel = await speak(text, characterId, {
          onEnd: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
        setCancelTTS(() => cancel);
        return;
      }

      // Fall back to backend ElevenLabs API
      try {
        const { audioUrl } = await apiGenerateVoice(characterId, text);
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.play();
        setCurrentAudio(audio);
        setIsPlaying(true);
      } catch (err) {
        console.error('Voice playback failed:', err);
      }
    },
    [isPlaying, currentAudio, cancelTTS]
  );

  const playAudioUrl = useCallback(
    (url: string) => {
      if (currentAudio) currentAudio.pause();
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setCurrentAudio(audio);
      setIsPlaying(true);
    },
    [currentAudio]
  );

  const stopAudio = useCallback(() => {
    stopSpeaking();
    if (cancelTTS) cancelTTS();
    if (currentAudio) {
      currentAudio.pause();
    }
    setIsPlaying(false);
    setCancelTTS(null);
  }, [currentAudio, cancelTTS]);

  const startCall = useCallback(async (characterId: string) => {
    return apiStartVoiceCall(characterId);
  }, []);

  return { isPlaying, playVoice, playAudioUrl, stopAudio, startCall };
}
