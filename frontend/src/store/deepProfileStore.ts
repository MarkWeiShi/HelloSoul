import { create } from 'zustand';
import type { DeepProfile, GrowthReport, ReflectionQuestion } from '../types/chat';

interface DeepProfileStore {
  profile: DeepProfile | null;
  growthReport: GrowthReport | null;
  reflectionQuestion: ReflectionQuestion | null;
  isLoading: boolean;

  setProfile: (profile: DeepProfile) => void;
  removeField: (fieldId: string) => void;
  clearProfile: () => void;
  setGrowthReport: (report: GrowthReport) => void;
  setReflectionQuestion: (question: ReflectionQuestion) => void;
  setLoading: (loading: boolean) => void;
}

export const useDeepProfileStore = create<DeepProfileStore>((set) => ({
  profile: null,
  growthReport: null,
  reflectionQuestion: null,
  isLoading: false,

  setProfile: (profile) => set({ profile }),

  removeField: (fieldId) =>
    set((state) => {
      if (!state.profile) return state;
      const { sections } = state.profile;
      const updated: DeepProfile = {
        ...state.profile,
        sections: {
          aboutYourLife: sections.aboutYourLife.filter((f) => f.id !== fieldId),
          thingsNoticed: sections.thingsNoticed.filter((f) => f.id !== fieldId),
          emotionalAnchors: sections.emotionalAnchors.filter((f) => f.id !== fieldId),
          growth: sections.growth.filter((f) => f.id !== fieldId),
        },
        totalFields: state.profile.totalFields - 1,
      };
      return { profile: updated };
    }),

  clearProfile: () => set({ profile: null }),

  setGrowthReport: (report) => set({ growthReport: report }),

  setReflectionQuestion: (question) => set({ reflectionQuestion: question }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
