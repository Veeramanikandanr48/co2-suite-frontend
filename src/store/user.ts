import { z } from "zod";
import { create } from "zustand";

// Define user schema
export const userSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, "Name requires a minimum of 3 characters"),
  role: z.string().optional()
});

export type User = z.infer<typeof userSchema>;

// Define Zustand store type
type UserState = {
  user: User;
  setUser: (values: Partial<User>) => void;
  setUserField: <K extends keyof User>(field: K, value: User[K]) => void;
  resetUser: () => void;
};

const defaultUser: User = {
  id: 1,
  name: "OMEA-01234",
  role: 'Admin',
};

// Create Zustand store
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
