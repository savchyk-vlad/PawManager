import React from "react";
import { View, Text } from "react-native";
import { WELCOME_VALUE_PROPS } from "../welcomeConstants";

type Styles = Record<string, object>;

export function WelcomeValuePropsCard({ styles }: { styles: Styles }) {
  return (
    <View style={styles.card}>
      {WELCOME_VALUE_PROPS.map((prop, i) => (
        <View key={prop.title}>
          <View style={styles.propRow}>
            <Text style={styles.propEmoji}>{prop.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.propTitle}>{prop.title}</Text>
              <Text style={styles.propSub}>{prop.sub}</Text>
            </View>
          </View>
          {i < WELCOME_VALUE_PROPS.length - 1 && <View style={styles.propDivider} />}
        </View>
      ))}
    </View>
  );
}
