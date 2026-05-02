import React from "react";
import { View, Text, Platform } from "react-native";
import { Dog } from "../types";
import { useThemeColors } from "../theme";

export type DogEmojiStackVariant =
  | "upNext"
  | "active"
  | "walkRow"
  | "completed"
  | "schedule"
  | "missed";

/** Overlapping dog emoji circles; each layer steps a few px so faces stay readable. */
export function DogEmojiStack({
  dogs,
  variant,
}: {
  dogs: Pick<Dog, "id" | "emoji">[];
  variant: DogEmojiStackVariant;
}) {
  const colors = useThemeColors();
  const walkAvatarBg = colors.surfaceHigh;
  const divider = colors.border;
  const presets: Record<
    DogEmojiStackVariant,
    {
      size: number;
      borderRadius: number;
      fontSize: number;
      /** Horizontal advance between circle left edges (smaller = tighter overlap). */
      step: number;
      borderWidth: number;
      borderColor: string;
      backgroundColor: string;
    }
  > = {
    upNext: {
      size: 56,
      borderRadius: 18,
      fontSize: 32,
      step: 14,
      borderWidth: 1,
      borderColor: divider,
      backgroundColor: walkAvatarBg,
    },
    active: {
      size: 58,
      borderRadius: 29,
      fontSize: 28,
      step: 15,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.35)",
      backgroundColor: "#FFFFFF",
    },
    walkRow: {
      size: 44,
      borderRadius: 12,
      fontSize: 20,
      step: 11,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.1)",
      backgroundColor: walkAvatarBg,
    },
    completed: {
      size: 48,
      borderRadius: 14,
      fontSize: 22,
      step: 12,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.1)",
      backgroundColor: walkAvatarBg,
    },
    schedule: {
      size: 24,
      borderRadius: 8,
      fontSize: 12,
      step: 9,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
      backgroundColor: walkAvatarBg,
    },
    missed: {
      size: 36,
      borderRadius: 18,
      fontSize: 17,
      step: 10,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.12)",
      backgroundColor: "#1A1A18",
    },
  };

  const p = presets[variant];
  const list = dogs.length > 0 ? dogs : [{ id: "_placeholder", emoji: "🐕" }];
  const multi = list.length > 1;

  const defaultRing =
    variant === "upNext"
      ? multi
        ? { borderWidth: p.borderWidth, borderColor: p.borderColor }
        : { borderWidth: 1, borderColor: divider }
      : variant === "walkRow" || variant === "completed"
        ? multi
          ? { borderWidth: p.borderWidth, borderColor: p.borderColor }
          : { borderWidth: 0, borderColor: "transparent" }
        : variant === "active"
          ? multi
            ? { borderWidth: p.borderWidth, borderColor: p.borderColor }
            : { borderWidth: 0, borderColor: "transparent" }
          : { borderWidth: p.borderWidth, borderColor: p.borderColor };

  const circleStyle = (index: number) => {
    const isFront = index === list.length - 1;
    let backgroundColor = p.backgroundColor;
    let borderWidth = defaultRing.borderWidth;
    let borderColor = defaultRing.borderColor;

    if (variant === "active") {
      backgroundColor =
        list.length === 1 || isFront ? "#FFFFFF" : "rgba(255,255,255,0.14)";
      borderWidth = 2;
      borderColor =
        list.length === 1 || isFront
          ? "rgba(255,255,255,0.55)"
          : "rgba(255,255,255,0.28)";
    } else if (
      (variant === "walkRow" || variant === "completed" || variant === "upNext") &&
      multi
    ) {
      backgroundColor = isFront ? walkAvatarBg : colors.surface;
      borderWidth = isFront ? 2 : 1;
      borderColor = isFront ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.45)";
    }

    return {
      width: p.size,
      height: p.size,
      borderRadius: p.borderRadius,
      backgroundColor,
      borderWidth,
      borderColor,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      marginLeft: index === 0 ? 0 : -(p.size - p.step),
      zIndex: index + 1,
      ...(Platform.OS === "android" ? { elevation: index + 1 } : {}),
    };
  };

  if (list.length === 1) {
    return (
      <View style={circleStyle(0)}>
        <Text style={{ fontSize: p.fontSize }}>{list[0].emoji}</Text>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {list.map((dog, index) => (
        <View key={dog.id} style={circleStyle(index)}>
          <Text style={{ fontSize: p.fontSize }}>{dog.emoji}</Text>
        </View>
      ))}
    </View>
  );
}
