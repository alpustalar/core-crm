import { ClinicHealthTourismConfig as IClinicHealthTourismConfig } from '@shared/generated-zod';

type Currency = IClinicHealthTourismConfig['defaultCurrency'];

/**
 * Entity static create() girişi. Komisyon (serviceFeePercent) burada YOK — satış komisyonu
 * platform geliridir ve platform-global env ayarından uygulanır (klinik başına ayarlanamaz).
 */
export interface CreateClinicHealthTourismConfigProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  isEnabled?: boolean;
  destinationCode?: string | null;
  nearbyHotelCodes?: string[];
  airportIata?: string | null;
  clinicLocationType?: string | null;
  clinicLocationCode?: string | null;
  pickupAddress?: string | null;
  defaultCurrency?: Currency;
}

/** Yalnız sağlanan (undefined olmayan) alanlar güncellenir. */
export interface UpdateClinicHealthTourismConfigProps {
  isEnabled?: boolean;
  destinationCode?: string | null;
  nearbyHotelCodes?: string[];
  airportIata?: string | null;
  clinicLocationType?: string | null;
  clinicLocationCode?: string | null;
  pickupAddress?: string | null;
  defaultCurrency?: Currency;
}
