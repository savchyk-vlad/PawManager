import React from "react";
import { Text } from "react-native";
import { EmptyPlaceholder } from "../../../components/EmptyPlaceholder";

type Props = {
  title: string;
  text: string;
  styles: any;
};

export function DashboardEmptyState({ title, text, styles }: Props) {
  return (
    <>
      <Text style={styles.sectionLabel}>{title}</Text>
      <EmptyPlaceholder text={text} />
    </>
  );
}
