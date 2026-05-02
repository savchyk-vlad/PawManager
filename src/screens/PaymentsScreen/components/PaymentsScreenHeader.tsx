import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, startOfMonth } from "date-fns";
import { useThemeColors } from "../../../theme";
import { PeriodPickerModal } from "../../../components/PeriodPickerModal";
import { createPaymentsScreenHeaderStyles } from "./PaymentsScreenHeader.styles";

type Props = {
  visibleMonth: Date;
  onSelectPeriod: (value: Date) => void;
  onExportPress: () => void;
};

export function PaymentsScreenHeader({ visibleMonth, onSelectPeriod, onExportPress }: Props) {
  const colors = useThemeColors();
  const st = useMemo(() => createPaymentsScreenHeaderStyles(colors), [colors]);

  const [pickerOpen, setPickerOpen] = useState(false);

  function commit(d: Date) {
    onSelectPeriod(startOfMonth(d));
  }

  function openPeriodPicker() {
    setPickerOpen(true);
  }

  return (
    <View style={st.headerShell}>
      <View style={st.headerTopRow}>
        <View style={st.headerLeft}>
          <Text style={st.headerTitle}>Payments</Text>
          <TouchableOpacity
            onPress={openPeriodPicker}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Selected period ${format(visibleMonth, "MMMM yyyy")}. Tap to choose month and year`}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
            <View style={st.periodRow}>
              <Text style={st.headerSubtitle}>{format(visibleMonth, "MMMM yyyy")}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.greenText} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={st.headerRight}>
          <TouchableOpacity
            style={st.exportButton}
            onPress={onExportPress}
            activeOpacity={0.82}>
            <Ionicons name="share-outline" size={18} color={colors.greenText} />
            <Text style={st.exportButtonText}>Export PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      <PeriodPickerModal
        visible={pickerOpen}
        value={visibleMonth}
        onClose={() => setPickerOpen(false)}
        onConfirm={(next) => commit(next)}
      />
    </View>
  );
}
