import { create } from "zustand";

interface WorkforceState {
  revision: number;
  notifyChanged: () => void;
}

export const useWorkforceStore = create<WorkforceState>((set) => ({
  revision: 0,
  notifyChanged: () => set((state) => ({ revision: state.revision + 1 })),
}));
