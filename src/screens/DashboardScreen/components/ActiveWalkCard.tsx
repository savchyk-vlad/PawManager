import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../../navigation";
import { useAppStore } from "../../../store";
import { Walk } from "../../../types";
import { DogEmojiStack } from "../../../components/DogEmojiStack";
import { colors } from "../../../theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatElapsed(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return [hours, minutes, secs]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }

  return [minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

type Props = { walk: Walk };

export function ActiveWalkCard({ walk }: Props) {
  const navigation = useNavigation<Nav>();
  const { clients } = useAppStore();
  const client = clients.find((c) => c.id === walk.clientId);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const updateElapsed = () => {
      if (!walk.startedAt) {
        setElapsed(0);
        return;
      }

      const startedAtMs = new Date(walk.startedAt).getTime();
      setElapsed(Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [walk.startedAt]);

  const dogs = client
    ? client.dogs.filter((d) => walk.dogIds.includes(d.id))
    : [];
  const dogNames = dogs.map((d) => d.name).join(" & ") || "Walk";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => navigation.navigate("ActiveWalk", { walkId: walk.id })}>
      <View style={styles.top}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ACTIVE WALK</Text>
        </View>
        <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
      </View>

      <View style={styles.body}>
        <DogEmojiStack variant="active" dogs={dogs} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{dogNames}</Text>
          <Text style={styles.meta}>
            {client?.name ?? "Client"} · {walk.durationMinutes} min walk
          </Text>
        </View>
        <View style={styles.chevron}>
          <Ionicons name="arrow-forward" size={18} color={colors.text} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.greenDeep,
    borderRadius: 24,
    padding: 18,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.88)",
    letterSpacing: 0.8,
  },
  timer: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 1,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  meta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
  },
  chevron: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
});
