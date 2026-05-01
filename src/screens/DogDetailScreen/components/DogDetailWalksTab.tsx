import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Client, Walk } from "../../../types";
import { RootStackParamList } from "../../../navigation";
import { colors } from "../../../theme";
import { walkCharge } from "../../../lib/walkMetrics";
import { formatWalkWhen } from "../dogDetailUtils";
import { Row } from "./Row";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type FontSet = {
  regular: string;
  medium: string;
  semi: string;
  bold: string;
};

type Styles = Record<string, object>;

const NOT_PROVIDED = "not provided";

export function DogDetailWalksTab({
  dogWalks,
  visibleWalks,
  walkShowCount,
  onLoadMore,
  walkStats,
  client,
  font,
  styles,
  screenW,
  navigation,
  allowOpenWalks = true,
}: {
  dogWalks: Walk[];
  visibleWalks: Walk[];
  walkShowCount: number;
  onLoadMore: () => void;
  walkStats: { totalEarned: number; avgMin: number; firstLabel: string };
  client: Client;
  font: FontSet;
  styles: Styles;
  screenW: number;
  navigation: Nav;
  allowOpenWalks?: boolean;
}) {
  const hasMoreWalks = dogWalks.length > walkShowCount;

  return (
    <View style={[styles.page, { width: screenW }]}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.secTitle, { fontFamily: font.semi }]}>Walk history · {dogWalks.length} total</Text>
        <View style={styles.infoCard}>
          {dogWalks.length === 0 ? (
            <View style={{ padding: 16 }}>
              <Text style={{ fontFamily: font.regular, color: colors.textMuted, fontSize: 14 }}>No walks yet.</Text>
            </View>
          ) : (
            visibleWalks.map((w, i) => {
              const settled = w.paymentStatus === "paid";
              const dotColor = settled ? colors.greenDefault : colors.textMuted;
              const amtColor = settled ? colors.greenDefault : colors.textMuted;
              return (
                <TouchableOpacity
                  key={w.id}
                  style={[styles.walkRow, i < visibleWalks.length - 1 && styles.walkRowBorder]}
                  onPress={allowOpenWalks ? () => navigation.navigate("ActiveWalk", { walkId: w.id }) : undefined}
                  activeOpacity={allowOpenWalks ? 0.75 : 1}
                  disabled={!allowOpenWalks}>
                  <View style={[styles.walkDot, { backgroundColor: dotColor }]} />
                  <Text style={[styles.walkDate, { fontFamily: font.medium }]} numberOfLines={1}>
                    {formatWalkWhen(w)}
                  </Text>
                  <Text style={[styles.walkDur, { fontFamily: font.regular }]}>
                    {w.actualDurationMinutes ?? w.durationMinutes} min
                  </Text>
                  <Text style={[styles.walkAmt, { fontFamily: font.semi, color: amtColor }]}>
                    {`$${walkCharge(w, client)}`}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {hasMoreWalks ? (
          <TouchableOpacity onPress={onLoadMore} style={styles.loadMore}>
            <Text style={[styles.loadMoreText, { fontFamily: font.medium }]}>Load more →</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={[styles.secTitle, { fontFamily: font.semi }]}>Summary</Text>
        <View style={styles.infoCard}>
          <Row
            label="Total walks"
            value={String(dogWalks.length)}
            font={font}
            notProvidedToken={NOT_PROVIDED}
            styles={styles}
          />
          <Row
            label="Total earned"
            value={`$${walkStats.totalEarned}`}
            font={font}
            notProvidedToken={NOT_PROVIDED}
            styles={styles}
            valueMid
          />
          {dogWalks.length > 0 ? (
            <>
              <Row
                label="Avg duration"
                value={`${walkStats.avgMin} min`}
                font={font}
                notProvidedToken={NOT_PROVIDED}
                styles={styles}
              />
              <Row
                label="First walk"
                value={walkStats.firstLabel}
                font={font}
                notProvidedToken={NOT_PROVIDED}
                styles={styles}
                last
              />
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
