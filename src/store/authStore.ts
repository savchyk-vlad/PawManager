import { create } from "zustand";
import {
  FunctionsHttpError,
  Session,
  User,
} from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/expoEnv";
import { fetchMembershipTier, MembershipTier } from "../lib/profileService";
import { useSettingsStore } from "./settingsStore";
import {
  buildMetadataPatch,
  hydrateSettingsFromUser,
  prefsFromStoreState,
} from "../lib/userSettingsSync";

async function messageFromFunctionsInvokeError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const raw = await error.context.text();
      try {
        const parsed = JSON.parse(raw) as { error?: unknown };
        if (typeof parsed.error === "string" && parsed.error.trim()) {
          return parsed.error.trim();
        }
      } catch {
        /* body was not JSON */
      }
      const trimmed = raw.trim();
      if (trimmed) return trimmed.slice(0, 500);
    } catch {
      /* ignore */
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  membershipTier: MembershipTier;

  setMembershipTier: (tier: MembershipTier) => void;
  setSession: (session: Session | null) => void;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    businessName?: string,
  ) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  updateFullName: (fullName: string) => Promise<string | null>;
  /** Saves business name + app preferences to `auth.users` raw_user_meta_data (Supabase Auth). */
  persistUserPrefs: () => Promise<string | null>;
  /**
   * Deletes the current auth user via Edge Function `delete-account` (service role).
   * The deployed function name must match exactly (e.g. not `delete-account-`).
   */
  deleteAccount: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  membershipTier: "free",

  setMembershipTier: (tier) => set({ membershipTier: tier }),
  setSession: (session) => {
    const user = session?.user ?? null;
    const prevId = get().user?.id;
    const nextId = user?.id ?? null;

    set({ session, user, loading: false });

    if (!user) {
      set({ membershipTier: "free" });
      useSettingsStore.getState().resetToDefaults();
      return;
    }

    if (prevId !== nextId) {
      hydrateSettingsFromUser(user);
      void fetchMembershipTier(user.id)
        .then((membershipTier) => {
          if (get().user?.id !== user.id) return;
          set({ membershipTier });
        })
        .catch(() => {
          if (get().user?.id !== user.id) return;
          set({ membershipTier: "free" });
        });
    }
  },

  signUp: async (email, password, fullName, businessName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName ?? "",
          business_name: businessName ?? "",
        },
      },
    });
    return error ? error.message : null;
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error ? error.message : null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    get().setSession(null);
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "pawmanager://reset-password",
    });
    return error ? error.message : null;
  },

  updateFullName: async (fullName) => {
    const current = supabase.auth.getUser
      ? (await supabase.auth.getUser()).data.user
      : null;
    const mergedMeta = {
      ...(current?.user_metadata ?? {}),
      full_name: fullName.trim(),
    };
    const { data, error } = await supabase.auth.updateUser({
      data: mergedMeta,
    });
    if (error) return error.message;
    set((state) => ({
      user: data.user ?? state.user,
      session: state.session
        ? { ...state.session, user: data.user ?? state.session.user }
        : state.session,
    }));
    return null;
  },

  persistUserPrefs: async () => {
    const st = useSettingsStore.getState();
    const prefs = prefsFromStoreState(st);
    const { data: fresh, error: guErr } = await supabase.auth.getUser();
    if (guErr) return guErr.message;
    const u = fresh.user;
    if (!u) return "Not signed in.";

    const patch = buildMetadataPatch(
      u.user_metadata as Record<string, unknown>,
      st.businessName.trim(),
      prefs,
    );

    const { data, error } = await supabase.auth.updateUser({ data: patch });
    if (error) return error.message;
    set((state) => ({
      user: data.user ?? state.user,
      session: state.session
        ? { ...state.session, user: data.user ?? state.session.user }
        : state.session,
    }));
    return null;
  },

  deleteAccount: async () => {
    if (!isSupabaseConfigured) {
      return "Supabase is not configured.";
    }

    await supabase.auth.refreshSession();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      return "Not signed in.";
    }

    const { data, error } = await supabase.functions.invoke("delete-account", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) {
      return messageFromFunctionsInvokeError(error);
    }

    const payload = data as { error?: string; ok?: boolean } | null;
    if (payload?.error) {
      return payload.error;
    }

    await supabase.auth.signOut();
    get().setSession(null);
    return null;
  },
}));
