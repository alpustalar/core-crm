import { AiToolExecutor } from './ai-tool-executor.service';
import { AI_TOOL_NAMES } from './ai-tool.definitions';
import { AiToolContext } from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { RedisService } from '@src/infrastructure/cache/redis/redis.service';
import { GetClinicHealthTourismConfigQuery } from '@modules/crm/health-tourism/config/application/queries/get-clinic-health-tourism-config/get-clinic-health-tourism-config.query';
import { SearchHotelsQuery } from '@modules/crm/health-tourism/hotel/application/queries/search-hotels/search-hotels.query';
import { GetHotelBookingsQuery } from '@modules/crm/health-tourism/hotel/application/queries/get-hotel-bookings/get-hotel-bookings.query';
import { InitiateBookingPaymentCommand } from '@modules/crm/health-tourism/booking-payment/application/commands/initiate-booking-payment/initiate-booking-payment.command';
import { HotelBookingIntent } from '@modules/crm/health-tourism/booking-payment/domain/booking-payment.contracts';

describe('AiToolExecutor — otel araçları (B2)', () => {
  const context: AiToolContext = {
    clinicId: 'clinic-1',
    organizationId: 'org-1',
    conversationId: 'conv-1',
    channel: 'WHATSAPP',
    contactName: 'Ali Veli',
    contactPhone: '+905550001122',
    patientId: null,
    leadId: 'lead-1',
  };

  const enabledConfig = {
    isEnabled: true,
    nearbyHotelCodes: ['H1', 'H2'],
    destinationCode: 'IST-CITY',
  };

  const oneHotel = [
    {
      code: 'H1',
      name: 'Otel Bir',
      currency: 'EUR',
      minRate: 100,
      maxRate: 100,
      rooms: [
        {
          code: 'DBL',
          name: 'Double Room',
          rates: [
            {
              rateKey: 'RK-LONG-OPAQUE-1',
              rateType: 'BOOKABLE',
              net: 100,
              currency: 'EUR',
              boardCode: 'BB',
              boardName: 'Kahvaltı',
              rooms: 1,
              adults: 2,
              children: 0,
            },
          ],
        },
      ],
    },
  ];

  const build = (overrides?: {
    hotels?: unknown;
    bookings?: unknown[];
    config?: unknown;
  }) => {
    const redisStore = new Map<string, unknown>();
    const redis = {
      setHotelRateOption: jest.fn((token: string, data: unknown) => {
        redisStore.set(token, data);
        return Promise.resolve();
      }),
      getHotelRateOption: jest.fn((token: string) =>
        Promise.resolve(redisStore.get(token) ?? null)
      ),
    } as unknown as RedisService;

    const queryBus = {
      execute: jest.fn((q: unknown) => {
        if (q instanceof GetClinicHealthTourismConfigQuery) {
          return Promise.resolve({
            data: overrides?.config ?? enabledConfig,
          });
        }
        if (q instanceof SearchHotelsQuery) {
          return Promise.resolve({ data: overrides?.hotels ?? oneHotel });
        }
        if (q instanceof GetHotelBookingsQuery) {
          return Promise.resolve({
            data: overrides?.bookings ?? [],
          });
        }
        throw new Error('beklenmeyen query');
      }),
    } as unknown as TSQueryBus;

    const commandBus = {
      execute: jest.fn().mockResolvedValue({
        bookingPaymentId: 'bp-1',
        saleAmount: 120,
        saleCurrency: 'EUR',
        iyzico: { url: 'https://iyzi/pay/bp-1', amount: 4200, currency: 'TRY' },
        stripe: { url: 'https://stripe/pay/bp-1', amount: 120, currency: 'EUR' },
      }),
    } as unknown as TSCommandBus;

    return {
      executor: new AiToolExecutor(commandBus, queryBus, redis),
      commandBus,
      redisStore,
    };
  };

  const call = (name: string, input: Record<string, unknown> = {}) => ({
    name,
    input,
  });

  it('search_hotels: kapsam allowlist ile aranır, rate Redis’e mühürlenir, kısa optionId döner', async () => {
    const { executor, redisStore } = build();
    const res = await executor.execute(
      call(AI_TOOL_NAMES.SEARCH_HOTELS, {
        checkIn: '2026-07-01',
        checkOut: '2026-07-05',
        adults: 2,
      }),
      context
    );

    const body = JSON.parse(res.content);
    expect(body.options).toHaveLength(1);
    const optionId = body.options[0].optionId;
    expect(optionId).toMatch(/^ht_/);
    // Opak rateKey LLM'e SIZMAZ; yalnız Redis'te durur.
    expect(res.content).not.toContain('RK-LONG-OPAQUE-1');
    expect(redisStore.get(optionId)).toMatchObject({
      rateKey: 'RK-LONG-OPAQUE-1',
      hotelCode: 'H1',
    });
  });

  it('config kapalıysa arama yapılmaz', async () => {
    const { executor } = build({ config: { ...enabledConfig, isEnabled: false } });
    const res = await executor.execute(
      call(AI_TOOL_NAMES.SEARCH_HOTELS, {
        checkIn: '2026-07-01',
        checkOut: '2026-07-05',
        adults: 2,
      }),
      context
    );
    expect(res.content).toContain('aktif değil');
  });

  it('book_hotel: ödeme-önce — iki link döner, rateKey gizli, intent taşır, misafir lead’e bağlanır', async () => {
    const { executor, commandBus } = build();
    const search = await executor.execute(
      call(AI_TOOL_NAMES.SEARCH_HOTELS, {
        checkIn: '2026-07-01',
        checkOut: '2026-07-05',
        adults: 2,
      }),
      context
    );
    const optionId = JSON.parse(search.content).options[0].optionId;

    const res = await executor.execute(
      call(AI_TOOL_NAMES.BOOK_HOTEL, {
        optionId,
        holderName: 'Ali',
        holderSurname: 'Veli',
      }),
      context
    );

    const body = JSON.parse(res.content);
    // Rezervasyon HEMEN açılmaz; iki ödeme linki döner.
    expect(body.paymentRequired).toBe(true);
    expect(body.tryLink.currency).toBe('TRY');
    expect(body.fxLink.currency).toBe('EUR');
    // Opak rateKey LLM'e SIZMAZ.
    expect(res.content).not.toContain('RK-LONG-OPAQUE-1');

    const cmd = (commandBus.execute as jest.Mock).mock
      .calls[0][0] as InitiateBookingPaymentCommand;
    expect(cmd).toBeInstanceOf(InitiateBookingPaymentCommand);
    expect(cmd.input.bookingType).toBe('HOTEL');
    expect(cmd.input.netAmount).toBe(100);
    expect(cmd.input.netCurrency).toBe('EUR');
    const intent = cmd.input.intent as HotelBookingIntent;
    expect(intent.rooms[0].rateKey).toBe('RK-LONG-OPAQUE-1');
    expect(cmd.input.leadId).toBe('lead-1'); // patientId yok → lead'e bağlandı
    expect(cmd.input.patientId).toBeNull();
  });

  it('book_hotel: optionId Redis’te yoksa süresi doldu mesajı', async () => {
    const { executor, commandBus } = build();
    const res = await executor.execute(
      call(AI_TOOL_NAMES.BOOK_HOTEL, {
        optionId: 'ht_yok',
        holderName: 'Ali',
        holderSurname: 'Veli',
      }),
      context
    );
    expect(res.content).toContain('süresi doldu');
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('cancel_hotel_booking: yazışmaya ait olmayan rezervasyon reddedilir', async () => {
    const { executor, commandBus } = build({ bookings: [] });
    const res = await executor.execute(
      call(AI_TOOL_NAMES.CANCEL_HOTEL_BOOKING, { bookingId: 'other-booking' }),
      context
    );
    expect(res.content).toContain('doğrulayamadım');
    expect(commandBus.execute).not.toHaveBeenCalled();
  });
});
