import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "pawmanager:onboardingCompleted:v1";

export async function getOnboardingCompleted(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === "1";
  } catch {
    return false;
  }
}

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  try {
    if (completed) {
      await AsyncStorage.setItem(KEY, "1");
    } else {
      await AsyncStorage.removeItem(KEY);
    }
  } catch {
    // Non-fatal; onboarding will show again if storage fails.
  }
}

