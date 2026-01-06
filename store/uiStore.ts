import { create } from 'zustand'

interface UIState {
  showContactInfo: boolean
  showNewMessageModal: boolean
  searchQuery: string
  activeTab: 'media' | 'link' | 'docs'
  setShowContactInfo: (show: boolean) => void
  setShowNewMessageModal: (show: boolean) => void
  setSearchQuery: (query: string) => void
  setActiveTab: (tab: 'media' | 'link' | 'docs') => void
}

export const useUIStore = create<UIState>((set) => ({
  showContactInfo: false,
  showNewMessageModal: false,
  searchQuery: '',
  activeTab: 'media',
  setShowContactInfo: (show) => set({ showContactInfo: show }),
  setShowNewMessageModal: (show) => set({ showNewMessageModal: show }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}))

