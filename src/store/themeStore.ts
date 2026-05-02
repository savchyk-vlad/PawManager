import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  darkPalette,
  lightPalette,
  type ThemeColors,
} from "../theme/palettes";

export type Appearance = "dark" | "light";

/** First launch and any persisted value other than `"light"` use dark. */
export const DEFAULT_APPEARANCE: Appearance = "dark";

function paletteFor(appearance: Appearance): ThemeColors {
  return appearance === "dark" ? darkPalette : lightPalette;
}

type ThemeState = {
  appearance: Appearance;
  colors: ThemeColors;
  setAppearance: (appearance: Appearance) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      appearance: DEFAULT_APPEARANCE,
      colors: paletteFor(DEFAULT_APPEARANCE),
      setAppearance: (appearance) =>
        set({
          appearance,
          colors: paletteFor(appearance),
        }),
    }),
    {
      name: "pawmanager-appearance-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ appearance: s.appearance }),
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<{ appearance: Appearance }> | undefined;
        const appearance: Appearance =
          p?.appearance === "light" ? "light" : DEFAULT_APPEARANCE;
        return {
          ...currentState,
          appearance,
          colors: paletteFor(appearance),
        };
      },
    }
  )
);
