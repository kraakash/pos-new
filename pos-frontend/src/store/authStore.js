import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: localStorage.getItem('token') ? {
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
    username: localStorage.getItem('userUsername') || '',
  } : null,

  setUser: (userData) => {
    if (userData) {
      // Sync names
      const name = userData.fullName || userData.name || '';
      const email = userData.email || '';
      const username = userData.username || '';

      if (name) localStorage.setItem('userName', name);
      if (email) localStorage.setItem('userEmail', email);
      if (username) localStorage.setItem('userUsername', username);

      set((state) => ({
        user: {
          ...state.user,
          ...userData,
          name: name || (state.user ? state.user.name : ''),
          email: email || (state.user ? state.user.email : ''),
          username: username || (state.user ? state.user.username : ''),
        }
      }));
    } else {
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userUsername');
      set({ user: null });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userUsername');
    set({ user: null });
  }
}));
