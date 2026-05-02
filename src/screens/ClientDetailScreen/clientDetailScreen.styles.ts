import { StyleSheet } from "react-native";
import type { ThemeColors } from "../../theme";

export function createClientDetailScreenStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: { backgroundColor: colors.greenDeep, paddingHorizontal: 16, paddingBottom: 18 },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 10,
    marginBottom: 16,
    minHeight: 44,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  headerBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    minWidth: 0,
  },

  headerTextCol: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  avatarLg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarLgText: { fontSize: 18, fontWeight: "700", color: "white" },
  clientName: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    letterSpacing: -0.3,
    textAlign: "right",
  },
  clientSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
    textAlign: "right",
  },

  infoStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  infoStatBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNum: { fontSize: 19, fontWeight: "700", color: colors.text, marginBottom: 2 },
  statLbl: { fontSize: 10, color: colors.textMuted },

  actionsRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  actionLabel: { fontSize: 13, fontWeight: "600", color: "white" },

  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.greenDeep,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 13 },
  tabLabel: { fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.45)" },
  tabLabelActive: { color: "white", fontWeight: "600" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 2,
    width: 24,
    borderRadius: 1,
    backgroundColor: colors.greenDefault,
  },

  tabPage: {
    flex: 1,
    minHeight: 0,
  },
  tabPageScroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  content: { padding: 16, paddingBottom: 56 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surfaceHigh,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cardHeaderText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.textMuted,
  },

  dogsCardsList: {
    gap: 10,
  },

  walkCardsList: {
    gap: 10,
  },
  walkCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },

  dogClientCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },
  dogClientCardTop: {
    backgroundColor: colors.surfaceHigh,
  },

  dogCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
  },
  dogAvatarLg: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#252820",
    alignItems: "center",
    justifyContent: "center",
  },
  dogName: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 2 },
  dogBreed: { fontSize: 13, color: colors.textMuted },
  dogMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  dogStatStrip: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: "center",
  },
  dogStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 0,
    minHeight: 26,
  },
  dogStatAmber: { backgroundColor: "rgba(240,160,48,0.14)" },
  dogStatTxt: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textMuted,
    lineHeight: 11,
    paddingTop: 0,
    includeFontPadding: false,
  },

  traitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  trait: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  traitText: { fontSize: 12, fontWeight: "500" },

  dogInfoBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoKey: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  infoVal: {
    fontSize: 14,
    color: colors.text,
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
    lineHeight: 20,
  },

  walkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  walkDate: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 3 },
  walkMeta: { fontSize: 12, color: colors.textSecondary },
  walkRightCol: { alignItems: "flex-end", gap: 10, marginLeft: 10 },
  walkBadgesTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: "600" },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  paymentBadgeText: { fontSize: 10, fontWeight: "700" },

  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: 14,
  },
  paymentsBtn: {
    marginTop: 14,
    backgroundColor: colors.greenDeep,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexDirection: "row",
  },
  paymentsBtnText: { color: "white", fontSize: 14, fontWeight: "700" },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
  emptyDogs: { paddingTop: 32, alignItems: "center", gap: 16 },
  addDogCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  addDogCtaText: { fontSize: 16, fontWeight: "600", color: colors.greenDefault },
  addDogFooter: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  addDogFooterText: { fontSize: 15, fontWeight: "600", color: colors.greenDefault },
  });
}
