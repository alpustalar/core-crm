import { TransferAvailabilityItem } from '../types/transfer-availability.type';

export const HOTELBEDS_TRANSFER_API_SERVICE = Symbol(
  'IHotelbedsTransferApiService',
);

export interface TransferAvailabilityParams {
  language: string;
  fromType: string;
  fromCode: string;
  toType: string;
  toCode: string;
  outboundDate: string;
  outboundTime: string;
  adults: number;
  children: number;
  infants: number;
  ages?: string;
  returnDate?: string;
  returnTime?: string;
}

export interface TransferDetail {
  type: 'FLIGHT' | 'CRUISE' | 'TRAIN';
  direction: 'ARRIVAL' | 'DEPARTURE';
  code: string;
  companyName?: string | null;
}

export interface TransferBookingExtra {
  units: string;
  code: string;
}

export interface TransferPickupInformation {
  name?: string;
  address?: string;
  town?: string;
  country?: string;
  zip?: string;
}

export interface TransferBookingInput {
  rateKey: string;
  transferDetails: TransferDetail[];
  extras?: TransferBookingExtra[];
  pickupInformation?: TransferPickupInformation;
}

export interface CreateTransferBookingParams {
  language: string;
  holder: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  transfers: TransferBookingInput[];
  clientReference?: string;
  welcomeMessage?: string;
  remark?: string;
}

export interface TransferBookingResult {
  reference: string;
  creationDate: string;
  status: string;
  holder: { name: string; surname: string; email?: string; phone?: string };
  transfers: unknown[];
  totalAmount: number;
  currency: string;
  supplier?: { name: string };
}

export interface CancelTransferBookingResult {
  reference: string;
  status: string;
  cancellationAmount: number;
}

export interface IHotelbedsTransferApiService {
  searchAvailability(
    params: TransferAvailabilityParams,
  ): Promise<TransferAvailabilityItem[]>;
  createBooking(
    params: CreateTransferBookingParams,
  ): Promise<TransferBookingResult>;
  getBooking(
    language: string,
    reference: string,
  ): Promise<TransferBookingResult>;
  cancelBooking(
    language: string,
    reference: string,
  ): Promise<CancelTransferBookingResult>;
}
