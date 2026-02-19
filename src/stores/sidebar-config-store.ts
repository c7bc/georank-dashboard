import { create } from 'zustand';

export interface SidebarConfig {
  variant: 'sidebar' | 'floating' | 'inset';
  collapsible: 'offcanvas' | 'icon' | 'none';
  side: 'left' | 'right';
}

interface SidebarConfigState {
  config: SidebarConfig;
  updateConfig: (config: Partial<SidebarConfig>) => void;
}

export const useSidebarConfigStore = create<SidebarConfigState>((set) => ({
  config: {
    variant: 'inset',
    collapsible: 'offcanvas',
    side: 'left',
  },
  updateConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),
}));
