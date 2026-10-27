// authStore.js — Zustand auth store
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,

  setDemoUser: () => {
    const token = 'demo_' + Date.now();
    localStorage.setItem('nexus_demo_token', token);
    set({ user: { name: 'Demo Engineer', email: 'demo@nexus.ai' }, token });
  },

  logout: () => {
    localStorage.removeItem('nexus_demo_token');
    set({ user: null, token: null });
  },

  init: () => {
    const token = localStorage.getItem('nexus_demo_token');
    if (token) {
      set({ user: { name: 'Demo Engineer', email: 'demo@nexus.ai' }, token });
    }
  }
}));
