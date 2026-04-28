export const CLIENT_DETAIL_TABS = ["Dogs", "Walks", "Info"] as const;
export type ClientDetailTab = (typeof CLIENT_DETAIL_TABS)[number];
