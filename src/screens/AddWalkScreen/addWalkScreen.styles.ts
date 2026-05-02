import { StyleSheet } from "react-native";
import type { ThemeColors } from "../../theme";

export function createAddWalkScreenStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.greenDeep,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
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
  clientPending: {
    fontSize: 12,
    color: colors.greenDefault,
    marginBottom: 8,
    marginTop: -4,
  },

  borderedCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  borderedCardHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.surfaceHigh,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  borderedCardHeaderLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.textMuted,
  },

  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: colors.surface,
  },
  clientRowActive: { backgroundColor: colors.greenDeep },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  clientInitial: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#252522",
    alignItems: "center",
    justifyContent: "center",
  },
  clientInitialActive: { backgroundColor: colors.greenDeep },
  clientInitialText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textMuted,
  },
  clientName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  clientMeta: { fontSize: 12, color: colors.textSecondary },
  emptyClients: { paddingHorizontal: 14, paddingVertical: 16 },
  emptyClientsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 4,
  },
  emptyClientsText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.greenDeep,
    borderColor: colors.greenDeep,
  },

  saveFullBtn: {
    marginTop: 28,
    backgroundColor: colors.greenDeep,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
  },
  saveFullBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
  });
}
