export interface TransferAvailabilityItem {
  id: number;
  direction: 'DEPARTURE' | 'ARRIVAL';
  transferType: string;
  vehicle: { code: string; name: string };
  category: { code: string; name: string };
  adults: number;
  children: number;
  infants: number;
  price: { totalAmount: number; netAmount: number; currencyId: string };
  rateKey: string;
  pickupInformation: {
    from: { code: string; type: string };
    to: { code: string; type: string };
    date: string;
    time: string | null;
    pickup?: {
      checkPickup?: {
        mustCheckPickupTime: boolean;
        url?: string;
        hoursBeforeConsulting?: number;
      };
    };
  };
  cancellationPolicies: Array<{ amount: number; from: string }>;
  content?: {
    images?: unknown[];
    transferRemarks?: Array<{ type: string; text: string }>;
  };
  extras?: Array<{
    code: string;
    name: string;
    type: string;
    price: number;
    minUnits: number;
    maxUnits: number;
    required: boolean;
  }>;
}
