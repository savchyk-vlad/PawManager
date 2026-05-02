import { supabase } from "./supabase";

export type MembershipTier = "free" | "pro";

type DbProfile = {
  membership_tier: MembershipTier | null;
};

export async function fetchMembershipTier(
  userId: string,
): Promise<MembershipTier> {
  const { data, error } = await supabase
    .from("profiles")
    .select("membership_tier")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const row = data as DbProfile | null;
  return row?.membership_tier === "pro" ? "pro" : "free";
}

