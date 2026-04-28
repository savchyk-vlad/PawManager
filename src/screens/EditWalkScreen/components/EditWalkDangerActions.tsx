import React from "react";
import { Text, TouchableOpacity, ActivityIndicator } from "react-native";

type Styles = {
  dangerSectionLabel: object;
  cancelWalkBtn: object;
  cancelWalkBtnText: object;
};

export function EditWalkDangerActions({
  styles,
  cancelling,
  saving,
  onCancelWalkPress,
}: {
  styles: Styles;
  cancelling: boolean;
  saving: boolean;
  onCancelWalkPress: () => void;
}) {
  return (
    <>
      <Text style={styles.dangerSectionLabel}>REMOVE</Text>
      <TouchableOpacity
        style={[styles.cancelWalkBtn, (saving || cancelling) && { opacity: 0.45 }]}
        onPress={onCancelWalkPress}
        disabled={saving || cancelling}
        activeOpacity={0.85}>
        {cancelling ? (
          <ActivityIndicator color="#E87070" />
        ) : (
          <Text style={styles.cancelWalkBtnText}>Cancel walk</Text>
        )}
      </TouchableOpacity>
    </>
  );
}
