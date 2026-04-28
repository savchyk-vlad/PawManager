import { WALK_DURATION_PRESETS } from "../../store/settingsStore";
import { Client, Walk } from "../../types";

export function applyFieldsFromWalk(w: Walk, client: Client | undefined) {
  const d = new Date(w.scheduledAt);
  const hasPresetDuration = (WALK_DURATION_PRESETS as readonly number[]).includes(w.durationMinutes);
  const per = w.perDogPrices;
  const hasPerDog = per != null && Object.keys(per).length > 0;
  const ov = w.pricePerWalkOverride;
  const hasUniform = ov != null && Number.isFinite(ov) && ov >= 0;
  const base = client?.pricePerWalk ?? 0;

  const ids = [...new Set(w.dogIds)];
  const dogPrices: Record<string, string> = {};
  for (const id of ids) {
    if (hasPerDog && per != null && per[id] != null && Number.isFinite(per[id])) {
      dogPrices[id] = String(per[id]);
    } else if (hasUniform) {
      dogPrices[id] = String(ov);
    } else {
      dogPrices[id] = String(base);
    }
  }

  return {
    selectedTime: w.scheduledAt,
    monthDate: new Date(d.getFullYear(), d.getMonth(), 1),
    duration: w.durationMinutes,
    customDuration: hasPresetDuration ? "" : String(w.durationMinutes),
    notes: w.notes ?? "",
    dogPrices,
  };
}
