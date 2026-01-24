import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Meeting } from '@/types'

interface AppState {
  // 현재 선택된 동네
  currentRegion: string
  setCurrentRegion: (region: string) => void

  // 사용자 정보
  user: User | null
  setUser: (user: User | null) => void

  // 모임 목록 필터
  filters: {
    gameType: string | null
    minLevel: number | null
    dateRange: 'today' | 'week' | 'month' | null
  }
  setFilters: (filters: Partial<AppState['filters']>) => void
  resetFilters: () => void

  // 로딩 상태
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const initialFilters = {
  gameType: null,
  minLevel: null,
  dateRange: null,
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentRegion: '',
      setCurrentRegion: (region) => set({ currentRegion: region }),

      user: null,
      setUser: (user) => set({ user }),

      filters: initialFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: initialFilters }),

      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'gyeongdo-storage',
      partialize: (state) => ({
        currentRegion: state.currentRegion,
      }),
    }
  )
)
