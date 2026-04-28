export const DOG_DETAIL_TAB_KEYS = ["profile", "vet", "walks"] as const;
export type DogDetailTabKey = (typeof DOG_DETAIL_TAB_KEYS)[number];

export const DOG_DETAIL_TABS: { key: DogDetailTabKey; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "vet", label: "Vet & Health" },
  { key: "walks", label: "Walks" },
];
