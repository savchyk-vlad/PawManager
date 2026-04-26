export type WalkStatus = 'scheduled' | 'in_progress' | 'done' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  emoji: string;
  traits: { label: string; type: 'positive' | 'warning' }[];
  vet: string;
  vetPhone: string;
  medical: string;
  keyLocation: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  pricePerWalk: number;
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
  actualDurationMinutes?: number;
  notes?: string;
  startedAt?: string;
  finishedAt?: string;
}
