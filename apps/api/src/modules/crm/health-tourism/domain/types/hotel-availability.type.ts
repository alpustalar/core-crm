export interface HotelRate {
  rateKey: string;
  rateType: 'BOOKABLE' | 'RECHECK';
  net: number;
  currency: string;
  boardCode: string;
  boardName?: string;
  rooms: number;
  adults: number;
  children: number;
  cancellationPolicies?: CancellationPolicy[];
}

export interface CancellationPolicy {
  amount: string;
  from: string;
}

export interface HotelAvailabilityItem {
  code: string;
  name: string;
  categoryCode?: string;
  categoryName?: string;
  destinationCode?: string;
  destinationName?: string;
  latitude?: number;
  longitude?: number;
  currency: string;
  minRate: number;
  maxRate: number;
  rooms: HotelRoomOption[];
}

export interface HotelRoomOption {
  code: string;
  name?: string;
  rates: HotelRate[];
}
