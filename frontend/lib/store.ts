import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ProjectData, ChatMessage, MatchResult } from './types';

interface AppState {
  // プロジェクトデータ
  projectData: ProjectData;
  setProjectData: (data: ProjectData) => void;
  updateProjectData: (data: Partial<ProjectData>) => void;
  
  // チャット履歴
  chatHistory: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  // マッチング結果
  matchResults: MatchResult[] | null;
  requirements: any | null;
  setMatchResults: (results: MatchResult[], requirements: any) => void;
  
  // UI状態
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // リセット
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // 初期状態
        projectData: {},
        chatHistory: [],
        matchResults: null,
        requirements: null,
        isLoading: false,

        // アクション
        setProjectData: (data) => 
          set({ projectData: data }, false, 'setProjectData'),
        
        updateProjectData: (data) =>
          set(
            (state) => ({ projectData: { ...state.projectData, ...data } }),
            false,
            'updateProjectData'
          ),
        
        addMessage: (message) =>
          set(
            (state) => ({
              chatHistory: [...state.chatHistory, message]
            }),
            false,
            'addMessage'
          ),
        
        clearChat: () =>
          set({ chatHistory: [] }, false, 'clearChat'),
        
        setMatchResults: (results, requirements) =>
          set(
            { matchResults: results, requirements },
            false,
            'setMatchResults'
          ),
        
        setIsLoading: (loading) =>
          set({ isLoading: loading }, false, 'setIsLoading'),
        
        resetAll: () =>
          set(
            {
              projectData: {},
              chatHistory: [],
              matchResults: null,
              requirements: null,
              isLoading: false,
            },
            false,
            'resetAll'
          ),
      }),
      {
        name: 'developer-matching-storage',
        partialize: (state) => ({
          projectData: state.projectData,
          chatHistory: state.chatHistory,
        }),
      }
    ),
    {
      name: 'DeveloperMatching',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
