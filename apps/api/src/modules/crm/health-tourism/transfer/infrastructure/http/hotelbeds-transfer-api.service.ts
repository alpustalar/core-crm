import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants/env.constant';
import {
  CancelTransferBookingResult,
  CreateTransferBookingData,
  TransferAvailabilityFilter,
  TransferAvailabilityItem,
  TransferBookingResult,
} from '@modules/crm/health-tourism/transfer/domain/transfer.contracts';
import {
  IHotelbedsTransferApiService
} from '@modules/crm/health-tourism/transfer/domain/interfaces/hotelbeds-transfer-api.interface';

const TRANSFER_API_BASE = 'https://api.hotelbeds.com/transfer-api/1.0';

@Injectable()
export class HotelbedsTransferApiService
  implements IHotelbedsTransferApiService
{
  private readonly logger = new Logger(HotelbedsTransferApiService.name);
  private readonly apiKey: string;
  private readonly secret: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.getOrThrow<string>(
      ENV.HOTELBEDS_TRANSFER_API_KEY
    );
    this.secret = this.config.getOrThrow<string>(ENV.HOTELBEDS_TRANSFER_SECRET);
  }

  async searchAvailability(
    filter: TransferAvailabilityFilter
  ): Promise<TransferAvailabilityItem[]> {
    const {
      language,
      fromType,
      fromCode,
      toType,
      toCode,
      outboundDate,
      outboundTime,
      adults,
      children,
      infants,
      ages,
      returnDate,
      returnTime,
    } = filter;

    let url = `${TRANSFER_API_BASE}/availability/${language}/from/${fromType}/${fromCode}/to/${toType}/${toCode}/${outboundDate}/${outboundTime}/${adults}/${children}/${infants}`;

    if (returnDate && returnTime) {
      url += `/return/${returnDate}/${returnTime}`;
    }

    if (ages) {
      url += `?ages=${ages}`;
    }

    const res = await fetch(url, {
      headers: this.buildHeaders(),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Transfer availability hatası: ${res.status} ${err}`);
      throw new Error(`Transfer availability hatası: ${res.status}`);
    }

    const json = (await res.json()) as { services?: RawTransferService[] };
    return (json.services ?? []).map(mapToAvailabilityItem);
  }

  async createBooking(
    data: CreateTransferBookingData
  ): Promise<TransferBookingResult> {
    const res = await fetch(`${TRANSFER_API_BASE}/bookings/${data.language}`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        language: data.language,
        holder: data.holder,
        transfers: data.transfers,
        ...(data.clientReference
          ? { clientReference: data.clientReference }
          : {}),
        ...(data.welcomeMessage ? { welcomeMessage: data.welcomeMessage } : {}),
        ...(data.remark ? { remark: data.remark } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Transfer booking hatası: ${res.status} ${err}`);
      throw new Error(`Transfer booking hatası: ${res.status}`);
    }

    const json = (await res.json()) as { RS?: { bookings?: RawBooking[] } };
    const booking = json.RS?.bookings?.[0];
    if (!booking) throw new Error('Transfer booking yanıtı boş.');

    return mapToBookingResult(booking);
  }

  async getBooking(
    language: string,
    reference: string
  ): Promise<TransferBookingResult> {
    const res = await fetch(
      `${TRANSFER_API_BASE}/bookings/${language}/reference/${reference}`,
      {
        headers: this.buildHeaders(),
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Transfer getBooking hatası: ${res.status} ${err}`);
      throw new Error(`Transfer getBooking hatası: ${res.status}`);
    }

    const json = (await res.json()) as { RS?: { bookings?: RawBooking[] } };
    const booking = json.RS?.bookings?.[0];
    if (!booking) throw new Error('Transfer rezervasyon bulunamadı.');

    return mapToBookingResult(booking);
  }

  async cancelBooking(
    language: string,
    reference: string
  ): Promise<CancelTransferBookingResult> {
    const res = await fetch(
      `${TRANSFER_API_BASE}/bookings/${language}/reference/${reference}`,
      {
        method: 'DELETE',
        headers: this.buildHeaders(),
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Transfer iptal hatası: ${res.status} ${err}`);
      throw new Error(`Transfer iptal hatası: ${res.status}`);
    }

    const json = (await res.json()) as { RS?: { bookings?: RawBooking[] } };
    const booking = json.RS?.bookings?.[0];
    if (!booking) throw new Error('Transfer iptal yanıtı boş.');

    return {
      reference: booking.reference,
      status: booking.status ?? 'CANCELLED',
      cancellationAmount: booking.cancellationAmount ?? 0,
    };
  }

  private buildHeaders(): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHash('sha256')
      .update(this.apiKey + this.secret + timestamp)
      .digest('hex');

    return {
      'Api-key': this.apiKey,
      'X-Signature': signature,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }
}

// ─── Raw API response types ───────────────────────────────────────────────────

interface RawPrice {
  totalAmount?: number;
  netAmount?: number;
  currencyId?: string;
}

interface RawPickupCheckPickup {
  mustCheckPickupTime?: boolean;
  url?: string;
  hoursBeforeConsulting?: number;
}

interface RawPickupInformation {
  from?: { code?: string; type?: string };
  to?: { code?: string; type?: string };
  date?: string;
  time?: string | null;
  pickup?: { checkPickup?: RawPickupCheckPickup };
}

interface RawTransferService {
  id?: number;
  direction?: string;
  transferType?: string;
  vehicle?: { code?: string; name?: string };
  category?: { code?: string; name?: string };
  adults?: number;
  children?: number;
  infants?: number;
  price?: RawPrice;
  rateKey?: string;
  pickupInformation?: RawPickupInformation;
  cancellationPolicies?: Array<{ amount?: number; from?: string }>;
  content?: {
    images?: unknown[];
    transferRemarks?: Array<{ type?: string; text?: string }>;
  };
  extras?: Array<{
    code?: string;
    name?: string;
    type?: string;
    price?: number;
    minUnits?: number;
    maxUnits?: number;
    required?: boolean;
  }>;
}

interface RawBooking {
  reference: string;
  creationDate?: string;
  status?: string;
  holder?: { name?: string; surname?: string; email?: string; phone?: string };
  transfers?: unknown[];
  totalAmount?: string;
  currency?: string;
  supplier?: { name?: string };
  cancellationAmount?: number;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapToAvailabilityItem(
  raw: RawTransferService
): TransferAvailabilityItem {
  return {
    id: raw.id ?? 0,
    direction: (raw.direction as 'DEPARTURE' | 'ARRIVAL') ?? 'ARRIVAL',
    transferType: raw.transferType ?? '',
    vehicle: { code: raw.vehicle?.code ?? '', name: raw.vehicle?.name ?? '' },
    category: {
      code: raw.category?.code ?? '',
      name: raw.category?.name ?? '',
    },
    adults: raw.adults ?? 0,
    children: raw.children ?? 0,
    infants: raw.infants ?? 0,
    price: {
      totalAmount: raw.price?.totalAmount ?? 0,
      netAmount: raw.price?.netAmount ?? 0,
      currencyId: raw.price?.currencyId ?? 'EUR',
    },
    rateKey: raw.rateKey ?? '',
    pickupInformation: {
      from: {
        code: raw.pickupInformation?.from?.code ?? '',
        type: raw.pickupInformation?.from?.type ?? '',
      },
      to: {
        code: raw.pickupInformation?.to?.code ?? '',
        type: raw.pickupInformation?.to?.type ?? '',
      },
      date: raw.pickupInformation?.date ?? '',
      time: raw.pickupInformation?.time ?? null,
      pickup: raw.pickupInformation?.pickup
        ? {
            checkPickup: raw.pickupInformation.pickup.checkPickup
              ? {
                  mustCheckPickupTime:
                    raw.pickupInformation.pickup.checkPickup
                      .mustCheckPickupTime ?? false,
                  url: raw.pickupInformation.pickup.checkPickup.url,
                  hoursBeforeConsulting:
                    raw.pickupInformation.pickup.checkPickup
                      .hoursBeforeConsulting,
                }
              : undefined,
          }
        : undefined,
    },
    cancellationPolicies: (raw.cancellationPolicies ?? []).map((p) => ({
      amount: p.amount ?? 0,
      from: p.from ?? '',
    })),
    content: raw.content
      ? {
          images: raw.content.images,
          transferRemarks: (raw.content.transferRemarks ?? []).map((r) => ({
            type: r.type ?? '',
            text: r.text ?? '',
          })),
        }
      : undefined,
    extras: raw.extras?.map((e) => ({
      code: e.code ?? '',
      name: e.name ?? '',
      type: e.type ?? '',
      price: e.price ?? 0,
      minUnits: e.minUnits ?? 0,
      maxUnits: e.maxUnits ?? 0,
      required: e.required ?? false,
    })),
  };
}

function mapToBookingResult(raw: RawBooking): TransferBookingResult {
  return {
    reference: raw.reference,
    creationDate: raw.creationDate ?? '',
    status: raw.status ?? 'CONFIRMED',
    holder: {
      name: raw.holder?.name ?? '',
      surname: raw.holder?.surname ?? '',
      email: raw.holder?.email,
      phone: raw.holder?.phone,
    },
    transfers: raw.transfers ?? [],
    totalAmount: parseFloat(raw.totalAmount ?? '0'),
    currency: raw.currency ?? 'EUR',
    supplier: raw.supplier?.name ? { name: raw.supplier.name } : undefined,
  };
}
