import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { ProjectData, ChatMessage, MatchResult } from './types';

interface AppState {
  projectData: ProjectData;
  setProjectData: (data: ProjectData) => void;
  updateProjectData: (data: Partial<ProjectData>) => void;
  chatHistory: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  matchResults: MatchResult[] | null;
  requirements: any | null;
  setMatchResults: (results: MatchResult[], requirements: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        projectData: {},
        chatHistory: [],
        matchResults: null,
        requirements: null,
        isLoading: false,
        
        setProjectData: (data) => set({ projectData: data }),
        
        updateProjectData: (data) => set((state) => ({ 
          projectData: { ...state.projectData, ...data } 
        })),
        
        addMessage: (message) => set((state) => ({ 
          chatHistory: [...state.chatHistory, message] 
        })),
        
        clearChat: () => set({ chatHistory: [] }),
        
        setMatchResults: (results, requirements) => set({ 
          matchResults: results, 
          requirements 
        }),
        
        setIsLoading: (loading) => set({ isLoading: loading }),
        
        resetAll: () => set({ 
          projectData: {}, 
          chatHistory: [], 
          matchResults: null, 
          requirements: null, 
          isLoading: false 
        }),
      }),
      {
        name: 'unrhub-matching-storage',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          projectData: state.projectData,
          chatHistory: state.chatHistory,
        }),
      }
    ),
    { name: 'UnrhubMatching' }
  )
);
