export type WalkStatus = 'scheduled' | 'in_progress' | 'done' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'no_pay';
export type PaymentMethod = 'cash' | 'venmo' | 'zelle' | 'card' | string;
export type DogTraitType = 'positive' | 'warning' | 'red';

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  emoji: string;
  traits: { label: string; type: DogTraitType }[];
  vet: string;
  vetPhone: string;
  medical: string;
  isDeleted?: boolean;
}

/** Structured mailing-style address (US-oriented). `line2` = apt / unit (optional). */
export interface ClientAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal: string;
}

export interface Client {
  id: string;
  name: string;
  address: ClientAddress;
  phone: string;
  pricePerWalk: number;
  keyLocation: string;
  dogs: Dog[];
}

export interface Walk {
  id: string;
  clientId: string;
  dogIds: string[];
  scheduledAt: string;
  durationMinutes: number;
  status: WalkStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  /** When set, billing uses this $/walk unit for every dog (uniform custom rate). Ignored if `perDogPrices` is set. */
  pricePerWalkOverride?: number;
  /** When set (non-empty), each dog id maps to its billable $ for this walk; total is the sum over unique dogs on the walk. */
  perDogPrices?: Record<string, number>;
  actualDurationMinutes?: number;
  notes?: string;
  startedAt?: string;
  finishedAt?: string;
}
