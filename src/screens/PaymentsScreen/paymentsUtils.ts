import { format, isSameMonth, parseISO, subMonths } from "date-fns";
import { Client, Walk } from "../../types";
import { walkCharge } from "../../lib/walkMetrics";

export type ClientPaymentsEntry = {
  client: Client;
  walks: Walk[];
  total: number;
  walkCount: number;
};

export type PaidWalkEntry = {
  walk: Walk;
  client: Client;
  amount: number;
  dogLabel: string;
};

export type MonthBar = {
  label: string;
  shortLabel: string;
  total: number;
  active: boolean;
};

export function currency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function walkDate(walk: Walk) {
  return parseISO(walk.scheduledAt);
}

export function dogNamesForWalk(walk: Walk, client: Client) {
  const dogs = client.dogs.filter((d) => walk.dogIds.includes(d.id));
  return dogs.map((d) => d.name).join(" + ") || "Walk";
}

export function sortByScheduleDesc(walks: Walk[]) {
  return [...walks].sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
}

export function sortByScheduleAsc(walks: Walk[]) {
  return [...walks].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export function monthBars(
  monthDate: Date,
  walks: Walk[],
  clients: Client[],
): MonthBar[] {
  return Array.from({ length: 6 }, (_, i) => subMonths(monthDate, 5 - i)).map(
    (month) => {
      const total = walks
        .filter(
          (walk) =>
            walk.status === "done" &&
            isSameMonth(walkDate(walk), month) &&
            walk.paymentStatus !== "no_pay",
        )
        .reduce((sum, walk) => {
          const client = clients.find((entry) => entry.id === walk.clientId);
          return sum + walkCharge(walk, client);
        }, 0);

      return {
        label: format(month, "MMMM"),
        shortLabel: format(month, "MMMM")[0],
        total,
        active: isSameMonth(month, monthDate),
      };
    },
  );
}
