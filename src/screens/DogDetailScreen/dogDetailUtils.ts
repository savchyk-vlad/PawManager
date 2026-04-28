import { format, isToday, parseISO, isValid } from "date-fns";
import { DogTraitType } from "../../types";
import { Walk } from "../../types";
import { colors } from "../../theme";

export function traitPillStyle(type: DogTraitType) {
  if (type === "positive") {
    return { bg: colors.greenSubtle, color: colors.greenDefault };
  }
  if (type === "red") {
    return { bg: colors.redSubtle, color: colors.redText };
  }
  return { bg: colors.amberSubtle, color: colors.amberDefault };
}

export function formatWalkWhen(w: Walk): string {
  const d = parseISO(w.scheduledAt);
  if (!isValid(d)) return "—";
  if (isToday(d)) return `Today · ${format(d, "h:mm a")}`;
  return format(d, "EEE, MMM d");
}
