import { create } from 'zustand'
import type { Exhibit } from '@/data/exhibits'

export type FloorStyle = 'grass' | 'wood' | 'stone' | 'rammed'
export type ControlMode = 'walk' | 'tour'

export interface TourTarget {
  pos: [number, number, number]
  look: [number, number, number]
}

/** 用户发表的点评（与种子点评结构一致，多一个 exhibitId 关联） */
export interface UserReview {
  id: string
  exhibitId: string
  name: string
  rating: number
  text: string
  time: string
}

export interface DecorationState {
  showPedestals: boolean
  showBenches: boolean
  showPriceTags: boolean
  showRopeBarriers: boolean
  showPlants: boolean
  showInfoStands: boolean
  wallColor: string
  floorStyle: FloorStyle
  entranceText: string
}

interface ExhibitStore {
  selectedExhibit: Exhibit | null
  hoveredExhibit: Exhibit | null
  isLocked: boolean
  isLoading: boolean
  loadedCount: number
  totalCount: number
  showDecorPanel: boolean
  decorations: DecorationState
  controlMode: ControlMode
  isTouch: boolean
  tourTarget: TourTarget | null
  showGuestbook: boolean
  /** 当前用户点赞过的展品 id（localStorage 持久化） */
  likedExhibitIds: string[]
  /** 当前用户发表的点评，按展品 id 组织（localStorage 持久化） */
  userReviews: Record<string, UserReview[]>
  selectExhibit: (exhibit: Exhibit | null) => void
  setHoveredExhibit: (exhibit: Exhibit | null) => void
  setLocked: (locked: boolean) => void
  setLoading: (loading: boolean) => void
  incrementLoaded: () => void
  setTotalCount: (count: number) => void
  setShowDecorPanel: (show: boolean) => void
  updateDecoration: <K extends keyof DecorationState>(key: K, value: DecorationState[K]) => void
  setControlMode: (mode: ControlMode) => void
  setIsTouch: (touch: boolean) => void
  setTourTarget: (target: TourTarget | null) => void
  setShowGuestbook: (show: boolean) => void
  toggleLike: (exhibitId: string) => void
  addReview: (exhibitId: string, name: string, rating: number, text: string) => void
}

const defaultDecorations: DecorationState = {
  showPedestals: true,
  showBenches: true,
  showPriceTags: false,
  showRopeBarriers: false,
  showPlants: true,
  showInfoStands: false,
  wallColor: '#F6F2E7',
  floorStyle: 'grass',
  entranceText: '八桂采鲜·亲子同欢\n刀马组创意海报展',
}

/* ---------------- 点赞/点评的本地持久化 ---------------- */

const LIKES_KEY = 'hall-liked-exhibits'
const REVIEWS_KEY = 'hall-user-reviews'

function loadLikedIds(): string[] {
  try {
    const raw = localStorage.getItem(LIKES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

function loadUserReviews(): Record<string, UserReview[]> {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const useExhibitStore = create<ExhibitStore>((set) => ({
  selectedExhibit: null,
  hoveredExhibit: null,
  isLocked: false,
  isLoading: true,
  loadedCount: 0,
  totalCount: 12,
  showDecorPanel: false,
  decorations: defaultDecorations,
  controlMode: 'walk',
  isTouch: false,
  tourTarget: null,
  showGuestbook: false,
  likedExhibitIds: loadLikedIds(),
  userReviews: loadUserReviews(),
  selectExhibit: (exhibit) => set({ selectedExhibit: exhibit }),
  setHoveredExhibit: (exhibit) => set({ hoveredExhibit: exhibit }),
  setLocked: (locked) => set({ isLocked: locked }),
  setLoading: (loading) => set({ isLoading: loading }),
  incrementLoaded: () =>
    set((state) => {
      const newCount = state.loadedCount + 1
      return {
        loadedCount: newCount,
        isLoading: newCount < state.totalCount,
      }
    }),
  setTotalCount: (count) => set({ totalCount: count }),
  setShowDecorPanel: (show) => set({ showDecorPanel: show }),
  updateDecoration: (key, value) =>
    set((state) => ({
      decorations: { ...state.decorations, [key]: value },
    })),
  setControlMode: (mode) => set({ controlMode: mode, tourTarget: null }),
  setIsTouch: (touch) => set({ isTouch: touch }),
  setTourTarget: (target) => set({ tourTarget: target }),
  setShowGuestbook: (show) => set({ showGuestbook: show }),
  toggleLike: (exhibitId) =>
    set((state) => {
      const liked = state.likedExhibitIds.includes(exhibitId)
      const likedExhibitIds = liked
        ? state.likedExhibitIds.filter((id) => id !== exhibitId)
        : [...state.likedExhibitIds, exhibitId]
      try {
        localStorage.setItem(LIKES_KEY, JSON.stringify(likedExhibitIds))
      } catch {
        /* 隐私模式等场景写入失败时静默降级为内存态 */
      }
      return { likedExhibitIds }
    }),
  addReview: (exhibitId, name, rating, text) =>
    set((state) => {
      const review: UserReview = {
        id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        exhibitId,
        name: name.trim() || '游客',
        rating,
        text: text.trim(),
        time: '刚刚',
      }
      const userReviews = {
        ...state.userReviews,
        [exhibitId]: [review, ...(state.userReviews[exhibitId] ?? [])],
      }
      try {
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(userReviews))
      } catch {
        /* 同上：写入失败时静默降级 */
      }
      return { userReviews }
    }),
}))

export default useExhibitStore
