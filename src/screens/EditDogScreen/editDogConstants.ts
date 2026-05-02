export const EDIT_DOG_STEPS = ["Basics", "Physical", "Traits", "Vet & notes"] as const;

/** Space under scroll content so fields clear the fixed footer (Next/Back bar). */
export const EDIT_DOG_FOOTER_SCROLL_PADDING = 96;

/**
 * Traits step: footer sits above keyboard — KeyboardAwareScrollView needs extra slack so
 * trait TextInputs aren’t covered (nested pager + measureInWindow).
 */
export const EDIT_DOG_TRAITS_EXTRA_SCROLL = 150;
export const EDIT_DOG_TRAITS_EXTRA_HEIGHT = 115;

export const EDIT_DOG_EMOJIS = ["🐕", "🦮", "🐩", "🐾", "🐶", "🐕‍🦺", "🦴"];
