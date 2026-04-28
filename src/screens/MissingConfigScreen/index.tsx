import React from "react";
import { StyleSheet } from "react-native";
import { MissingConfigInstructions } from "./components/MissingConfigInstructions";

export default function MissingConfigScreen() {
  return <MissingConfigInstructions styles={s} />;
}

const s = StyleSheet.create({
  outer: { padding: 24, paddingTop: 60, maxWidth: 520, alignSelf: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: "#111" },
  body: { fontSize: 15, lineHeight: 22, marginBottom: 16, color: "#333" },
  step: { fontSize: 14, lineHeight: 20, marginBottom: 6, color: "#222" },
  muted: { fontSize: 12, lineHeight: 18, marginTop: 20, color: "#666" },
});
