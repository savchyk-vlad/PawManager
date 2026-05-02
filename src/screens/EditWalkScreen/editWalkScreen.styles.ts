import { StyleSheet } from "react-native";
import type { ThemeColors } from "../../theme";

export function createEditWalkScreenStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  headerSpacer: { width: 36, height: 36 },
  content: { padding: 16, paddingBottom: 48 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: "hidden",
  },
  readOnlyName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  readOnlyMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  saveFull: {
    marginTop: 28,
    backgroundColor: colors.greenDeep,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
  },
  saveFullText: { fontSize: 15, fontWeight: "700", color: "white" },
  dangerSectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.1,
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 28,
  },
  cancelWalkBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(224, 64, 64, 0.45)",
    backgroundColor: "rgba(224, 64, 64, 0.08)",
  },
  cancelWalkBtnText: { fontSize: 15, fontWeight: "600", color: "#E87070" },
  });
}
