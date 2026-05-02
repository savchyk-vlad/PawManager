import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import { Client, Walk } from "../types";
import { TimeTakenModal } from "./TimeTakenModal";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  takenWalkId: string | null;
  walks: Walk[];
  clients: Client[];
  navigation: Nav;
  onDismiss: () => void;
};

export function WalkScheduleConflictModal({
  takenWalkId,
  walks,
  clients,
  navigation,
  onDismiss,
}: Props) {
  const w = takenWalkId ? walks.find((x) => x.id === takenWalkId) : undefined;
  const c = w ? clients.find((x) => x.id === w.clientId) : undefined;
  const dogs =
    w && c
      ? c.dogs
          .filter((d) => w.dogIds.includes(d.id))
          .map((d) => ({ emoji: d.emoji, name: d.name }))
      : [];

  if (!w || !c) return null;

  return (
    <TimeTakenModal
      visible
      onClose={onDismiss}
      onViewWalk={() => {
        onDismiss();
        navigation.navigate("ActiveWalk", { walkId: w.id });
      }}
      clientName={c.name}
      dogs={dogs}
      scheduledAtIso={w.scheduledAt}
      durationMinutes={w.durationMinutes}
    />
  );
}
