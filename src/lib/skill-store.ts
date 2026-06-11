'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SkillInvocation, TelemetryEvent, SkillConflict } from './skill-data';

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

  // Invocation history (replaces pipeline state)
  invocationHistory: SkillInvocation[];
  activeBatchId: string | null;
  addInvocation: (invocation: SkillInvocation) => void;
  clearInvocationHistory: () => void;
  setActiveBatchId: (batchId: string | null) => void;

  // Conflict detection cache
  detectedConflicts: SkillConflict[];
  setDetectedConflicts: (conflicts: SkillConflict[]) => void;

  // Telemetry (execution observability)
  telemetryBuffer: TelemetryEvent[];
  recordTelemetry: (event: TelemetryEvent) => void;
  flushTelemetry: () => Promise<void>;

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

      // ─── Invocation History ───
      invocationHistory: [],
      activeBatchId: null,
      addInvocation: (invocation) =>
        set((s) => ({
          invocationHistory: [invocation, ...s.invocationHistory].slice(0, 100),
        })),
      clearInvocationHistory: () => set({ invocationHistory: [] }),
      setActiveBatchId: (batchId) => set({ activeBatchId: batchId }),

      // ─── Conflict Cache ───
      detectedConflicts: [],
      setDetectedConflicts: (conflicts) => set({ detectedConflicts: conflicts }),

      // ─── Telemetry Buffer ───
      telemetryBuffer: [],
      recordTelemetry: (event) =>
        set((s) => ({
          telemetryBuffer: [...s.telemetryBuffer, event].slice(-200),
        })),
      flushTelemetry: async () => {
        const { telemetryBuffer } = get();
        if (telemetryBuffer.length === 0) return;

        // Batch send telemetry events to the API
        const events = [...telemetryBuffer];
        set({ telemetryBuffer: [] });

        try {
          await fetch('/api/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(events.length === 1 ? events[0] : { batch: events }),
          });
        } catch {
          // If telemetry send fails, re-buffer (but don't block UI)
          set((s) => ({
            telemetryBuffer: [...events, ...s.telemetryBuffer].slice(-200),
          }));
        }
      },

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
        invocationHistory: state.invocationHistory,
      }),
    }
  )
);
