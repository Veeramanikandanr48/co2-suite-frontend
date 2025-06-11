import { create } from "zustand";

interface User {
  id: number | undefined,
  name: string,
  role: string | undefined
}

// Define Zustand store type
type UserState = {
  user: User;
  setUser: (values: Partial<User>) => void;
  setUserField: <K extends keyof User>(field: K, value: User[K]) => void;
  resetUser: () => void;
};

const defaultUser: User = {
  id: 1,
  name: "Boiler-Plate-01234",
  role: 'Admin',
};

export const useUserStore = create<UserState>((set) => ({
  user: { ...defaultUser },

  setUser: (values) =>
    set((state) => ({
      user: { ...state.user, ...values },
    })),

  setUserField: (field, value) =>
    set((state) => ({
      user: { ...state.user, [field]: value },
    })),

  resetUser: () =>
    set({
      user: { ...defaultUser },
    }),
}));
