import { Platform } from "react-native";
import { supabase } from "./supabase";

export async function upsertUserPushToken(
  userId: string,
  token: string,
): Promise<void> {
  const normalized = token.trim();
  if (!userId || !normalized) return;

  const { error } = await supabase.from("user_push_tokens").upsert(
    {
      user_id: userId,
      token: normalized,
      platform: Platform.OS === "ios" || Platform.OS === "android" || Platform.OS === "web"
        ? Platform.OS
        : "unknown",
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id,token" },
  );

  if (error) {
    throw new Error(error.message);
  }
}
