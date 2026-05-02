import { useThemeStore } from "../store/themeStore";
import type { Appearance } from "../store/themeStore";

export function useThemeColors() {
  return useThemeStore((s) => s.colors);
}

export function useAppearance(): Appearance {
  return useThemeStore((s) => s.appearance);
}

export function useSetAppearance() {
  return useThemeStore((s) => s.setAppearance);
}
