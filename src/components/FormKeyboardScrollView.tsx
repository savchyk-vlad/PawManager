import React, { forwardRef, type ComponentProps } from 'react';
import { Platform } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAwareFlatList,
} from 'react-native-keyboard-aware-scroll-view';

const scrollDefaults: Partial<ComponentProps<typeof KeyboardAwareScrollView>> = {
  enableOnAndroid: true,
  enableAutomaticScroll: true,
  extraScrollHeight: 28,
  /** Wait for the system keyboard to open before scrolling to the focused field (~250ms matches the default iOS animation). */
  keyboardOpeningTime: 250,
  /**
   * When the keyboard hides, the default KASV behavior scrolls back to (0,0) or a saved offset — a second motion on top
   * of the OS keyboard animation. Keeping this off avoids that jump; pass `true` on a screen that needs the old snap-back.
   */
  enableResetScrollToCoords: false,
  keyboardShouldPersistTaps: 'handled',
};

const flatListDefaults: Partial<ComponentProps<typeof KeyboardAwareFlatList>> = {
  enableOnAndroid: true,
  enableAutomaticScroll: true,
  extraScrollHeight: 28,
  keyboardOpeningTime: 250,
  enableResetScrollToCoords: false,
  keyboardShouldPersistTaps: 'handled',
};

/** When dismissing the keyboard on scroll (interactive / on-drag), "handled" often blocks the gesture. Prefer "always" so drags go to the scroll view; tap still reaches buttons. */
function defaultKeyboardShouldPersistTaps(
  keyboardDismissIsInteractive: boolean,
): 'always' | 'handled' {
  return keyboardDismissIsInteractive ? 'always' : 'handled';
}

type FormScrollBase = ComponentProps<typeof KeyboardAwareScrollView> & {
  /**
   * When true, the keyboard follows the scroll/drag (iOS: `interactive`, Android: `on-drag`).
   * Overridden by an explicit `keyboardDismissMode` if you pass it.
   */
  smoothKeyboardHide?: boolean;
};

type FormFlatListBase = ComponentProps<typeof KeyboardAwareFlatList> & {
  smoothKeyboardHide?: boolean;
};

function resolveKeyboardDismissMode(
  smoothKeyboardHide: boolean | undefined,
  explicit: FormScrollBase['keyboardDismissMode'],
): 'none' | 'interactive' | 'on-drag' {
  if (explicit !== undefined) return explicit;
  if (smoothKeyboardHide) {
    return Platform.OS === 'ios' ? 'interactive' : 'on-drag';
  }
  return 'none';
}

/**
 * Use on a plain `ScrollView` / `FlatList` when you are not using `FormKeyboardScrollView`.
 * iOS: keyboard tracks the user’s scroll (`interactive`); Android: dismisses when dragging the list.
 */
export function smoothKeyboardHideDismissMode(): 'interactive' | 'on-drag' {
  return Platform.OS === 'ios' ? 'interactive' : 'on-drag';
}

type FormScrollProps = FormScrollBase;
type FormFlatListProps = FormFlatListBase;

/**
 * App-wide keyboard-aware scroll for forms. Prefer this over raw ScrollView when inputs may sit under the keyboard.
 * Use `viewIsInsideTabBar` for screens in the main tab navigator (extra bottom inset on iOS).
 * Do not wrap the same screen in `KeyboardAvoidingView` (double avoidance makes motion feel janky).
 * Scroll position after dismiss is not reset by default (`enableResetScrollToCoords: false`); set `enableResetScrollToCoords` or `resetScrollToCoords` if a screen should snap back.
 */
export const FormKeyboardScrollView = forwardRef<
  KeyboardAwareScrollView,
  FormScrollProps
>(function FormKeyboardScrollView(
  {
    viewIsInsideTabBar,
    smoothKeyboardHide,
    keyboardDismissMode: keyboardDismissModeProp,
    keyboardShouldPersistTaps: keyboardShouldPersistTapsProp,
    contentContainerStyle: contentContainerStyleProp,
    ...rest
  },
  ref,
) {
  const keyboardDismissMode = resolveKeyboardDismissMode(
    smoothKeyboardHide,
    keyboardDismissModeProp,
  );
  const useScrollDismiss = keyboardDismissMode !== 'none';
  const keyboardShouldPersistTaps =
    keyboardShouldPersistTapsProp ??
    defaultKeyboardShouldPersistTaps(useScrollDismiss);
  const contentContainerStyle = useScrollDismiss
    ? [contentContainerStyleProp, { flexGrow: 1 }]
    : contentContainerStyleProp;

  return (
    <KeyboardAwareScrollView
      ref={ref}
      {...scrollDefaults}
      viewIsInsideTabBar={viewIsInsideTabBar}
      {...rest}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={keyboardDismissMode}
    />
  );
});

/**
 * Keyboard-aware FlatList (e.g. list + search field). Set `viewIsInsideTabBar` for tab screens.
 */
export function FormKeyboardFlatList({
  viewIsInsideTabBar,
  smoothKeyboardHide,
  keyboardDismissMode: keyboardDismissModeProp,
  keyboardShouldPersistTaps: keyboardShouldPersistTapsProp,
  contentContainerStyle: contentContainerStyleProp,
  ...rest
}: FormFlatListProps) {
  const keyboardDismissMode = resolveKeyboardDismissMode(
    smoothKeyboardHide,
    keyboardDismissModeProp,
  );
  const useScrollDismiss = keyboardDismissMode !== 'none';
  const keyboardShouldPersistTaps =
    keyboardShouldPersistTapsProp ??
    defaultKeyboardShouldPersistTaps(useScrollDismiss);
  const contentContainerStyle = useScrollDismiss
    ? [contentContainerStyleProp, { flexGrow: 1 }]
    : contentContainerStyleProp;

  return (
    <KeyboardAwareFlatList
      {...flatListDefaults}
      viewIsInsideTabBar={viewIsInsideTabBar}
      {...rest}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={keyboardDismissMode}
    />
  );
}
