/** Kliniğin sağlık-turizmi config'i (FE + AI runtime). Gizli alan yok. */
export interface HealthTourismConfigResponse {
  id: string;
  clinicId: string;
  isEnabled: boolean;
  destinationCode: string | null;
  nearbyHotelCodes: string[];
  airportIata: string | null;
  clinicLocationType: string | null;
  clinicLocationCode: string | null;
  pickupAddress: string | null;
  /** Satış üzerine komisyon yüzdesi (ör. 12.5); yoksa null. */
  serviceFeePercent: number | null;
  defaultCurrency: 'TRY' | 'USD' | 'EUR' | 'GBP';
  createdAt: Date;
  updatedAt: Date;
}
