'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClipboardItem {
  id: string;
  command: string;
  skillName: string;
  copiedAt: number;
}

export interface BasketItem {
  skillId: string;
  addedAt: number;
}

interface SkillStore {
  // Clipboard
  clipboardHistory: ClipboardItem[];
  addToClipboard: (item: Omit<ClipboardItem, 'copiedAt'>) => void;
  clearClipboard: () => void;
  removeFromClipboard: (id: string) => void;

  // Basket
  basket: BasketItem[];
  addToBasket: (skillId: string) => void;
  removeFromBasket: (skillId: string) => void;
  clearBasket: () => void;
  isInBasket: (skillId: string) => boolean;

  // Selected skill for detail view
  selectedSkillId: string | null;
  setSelectedSkill: (id: string | null) => void;

  // UI state
  showClipboard: boolean;
  toggleClipboard: () => void;
  showBasket: boolean;
  toggleBasket: () => void;
}

export const useSkillStore = create<SkillStore>()(
  persist(
    (set, get) => ({
      clipboardHistory: [],
      addToClipboard: (item) =>
        set((s) => ({
          clipboardHistory: [
            { ...item, copiedAt: Date.now() },
            ...s.clipboardHistory.filter((c) => c.id !== item.id),
          ].slice(0, 20),
        })),
      clearClipboard: () => set({ clipboardHistory: [] }),
      removeFromClipboard: (id) =>
        set((s) => ({
          clipboardHistory: s.clipboardHistory.filter((c) => c.id !== id),
        })),

      basket: [],
      addToBasket: (skillId) =>
        set((s) => {
          if (s.basket.some((b) => b.skillId === skillId)) return s;
          return { basket: [...s.basket, { skillId, addedAt: Date.now() }] };
        }),
      removeFromBasket: (skillId) =>
        set((s) => ({ basket: s.basket.filter((b) => b.skillId !== skillId) })),
      clearBasket: () => set({ basket: [] }),
      isInBasket: (skillId) => get().basket.some((b) => b.skillId === skillId),

      selectedSkillId: null,
      setSelectedSkill: (id) => set({ selectedSkillId: id }),

      showClipboard: false,
      toggleClipboard: () => set((s) => ({ showClipboard: !s.showClipboard })),
      showBasket: false,
      toggleBasket: () => set((s) => ({ showBasket: !s.showBasket })),
    }),
    {
      name: 'skill-marketplace-store',
      partialize: (state) => ({
        clipboardHistory: state.clipboardHistory,
        basket: state.basket,
      }),
    }
  )
);
