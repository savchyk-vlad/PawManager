import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REVIEW_PROMPT_SHOWN_KEY = "pawmanager.review_prompt_shown.v1";

type StoreReviewModule = {
  isAvailableAsync?: () => Promise<boolean>;
  requestReview?: () => Promise<void>;
};

function loadStoreReviewModule(): StoreReviewModule | null {
  try {
    // Optional at runtime until dependencies are refreshed locally.
    // Included in package.json for the next native build.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("expo-store-review") as StoreReviewModule;
  } catch {
    return null;
  }
}

export async function maybePromptForFirstCompletedWalkReview(): Promise<void> {
  if (Platform.OS !== "ios") return;

  const alreadyShown = await AsyncStorage.getItem(REVIEW_PROMPT_SHOWN_KEY);
  if (alreadyShown === "1") return;

  const StoreReview = loadStoreReviewModule();
  if (!StoreReview?.isAvailableAsync || !StoreReview?.requestReview) return;

  const available = await StoreReview.isAvailableAsync();
  if (!available) return;

  await AsyncStorage.setItem(REVIEW_PROMPT_SHOWN_KEY, "1");

  setTimeout(() => {
    void StoreReview.requestReview?.().catch(() => {
      /* no-op */
    });
  }, 1200);
}
