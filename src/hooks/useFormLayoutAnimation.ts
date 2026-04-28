import { useLayoutEffect, useRef } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

let androidLayoutAnimationEnabled = false;

function ensureAndroidLayoutAnimation(): void {
  if (Platform.OS !== 'android') return;
  if (androidLayoutAnimationEnabled) return;
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
    androidLayoutAnimationEnabled = true;
  }
}

/**
 * Runs a layout animation when `key` changes (expand/collapse, sections mounting).
 * Skips the first transition so initial content does not animate in.
 * Pass `undefined` to disable (default for forms that opt out).
 */
export function useFormLayoutAnimationKey(key: string | undefined): void {
  const isFirst = useRef(true);

  useLayoutEffect(() => {
    if (key === undefined) return;
    ensureAndroidLayoutAnimation();
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [key]);
}
