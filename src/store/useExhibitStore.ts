import { create } from 'zustand'
import type { Exhibit } from '@/data/exhibits'

export type FloorStyle = 'grass' | 'wood' | 'stone' | 'rammed'
export type ControlMode = 'walk' | 'tour'

export interface TourTarget {
  pos: [number, number, number]
  look: [number, number, number]
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
}))

export default useExhibitStore
