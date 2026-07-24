import { AiToolExecutor } from './ai-tool-executor.service';
import { AiToolRegistry } from './ai-tool.registry';
import { AiToolSupport } from './ai-tool.support';
import { DiscoveryService } from '@nestjs/core';
import { SearchTransfersTool } from '@modules/crm/health-tourism/transfer/application/ai-tools/search-transfers.tool';
import { BookTransferTool } from '@modules/crm/health-tourism/transfer/application/ai-tools/book-transfer.tool';
import { GetTransferBookingsTool } from '@modules/crm/health-tourism/transfer/application/ai-tools/get-transfer-bookings.tool';
import { CancelTransferBookingTool } from '@modules/crm/health-tourism/transfer/application/ai-tools/cancel-transfer-booking.tool';
import { AI_TOOL_NAMES } from './ai-tool.definitions';
import { AiToolContext } from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetClinicHealthTourismConfigQuery } from '@modules/crm/health-tourism/config/application/queries/get-clinic-health-tourism-config/get-clinic-health-tourism-config.query';
import { SearchTransferAvailabilityQuery } from '@modules/crm/health-tourism/transfer/application/queries/search-transfer-availability/search-transfer-availability.query';
import { GetTransferBookingsQuery } from '@modules/crm/health-tourism/transfer/application/queries/get-transfer-bookings/get-transfer-bookings.query';
import { GetTransferRateOptionQuery } from '@modules/crm/health-tourism/transfer/application/queries/get-transfer-rate-option/get-transfer-rate-option.query';
import { CacheTransferRateOptionCommand } from '@modules/crm/health-tourism/transfer/application/commands/cache-transfer-rate-option/cache-transfer-rate-option.command';
import { InitiateBookingPaymentCommand } from '@modules/crm/health-tourism/booking-payment/application/commands/initiate-booking-payment/initiate-booking-payment.command';
import { TransferBookingIntent } from '@modules/crm/health-tourism/booking-payment/domain/contracts/booking-payment.contracts';

describe('AiToolExecutor — transfer araçları (B3)', () => {
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

  const fullConfig = {
    isEnabled: true,
    airportIata: 'IST',
    clinicLocationType: 'ATLAS',
    clinicLocationCode: 'HOTEL-123',
  };

  const oneTransfer = [
    {
      id: 1,
      direction: 'ARRIVAL',
      transferType: 'PRIVATE',
      vehicle: { code: 'V1', name: 'Sedan' },
      category: { code: 'C1', name: 'Standart' },
      adults: 2,
      children: 0,
      infants: 0,
      price: { totalAmount: 45, netAmount: 40, currencyId: 'EUR' },
      rateKey: 'TR-RK-OPAQUE-1',
      pickupInformation: {
        from: { code: 'IST', type: 'IATA' },
        to: { code: 'HOTEL-123', type: 'ATLAS' },
        date: '2026-07-01',
        time: '14:00',
      },
      cancellationPolicies: [],
    },
  ];

  const build = (overrides?: {
    transfers?: unknown;
    bookings?: unknown[];
    config?: unknown;
  }) => {
    // Rate-option cache artık bus üzerinden: CacheTransferRateOptionCommand (yaz) +
    // GetTransferRateOptionQuery (oku).
    const store = new Map<string, unknown>();

    const queryBus = {
      execute: jest.fn((q: unknown) => {
        if (q instanceof GetClinicHealthTourismConfigQuery) {
          return Promise.resolve({ data: overrides?.config ?? fullConfig });
        }
        if (q instanceof SearchTransferAvailabilityQuery) {
          return Promise.resolve({
            data: overrides?.transfers ?? oneTransfer,
            fromCache: false,
          });
        }
        if (q instanceof GetTransferBookingsQuery) {
          return Promise.resolve({
            data: overrides?.bookings ?? [],
          });
        }
        if (q instanceof GetTransferRateOptionQuery) {
          return Promise.resolve({ data: store.get(q.optionId) ?? null });
        }
        throw new Error('beklenmeyen query');
      }),
    } as unknown as TSQueryBus;

    const commandBus = {
      execute: jest.fn((c: unknown) => {
        if (c instanceof CacheTransferRateOptionCommand) {
          store.set(c.optionId, c.token);
          return Promise.resolve(undefined);
        }
        return Promise.resolve({
          bookingPaymentId: 'bp-tr-1',
          saleAmount: 45,
          saleCurrency: 'EUR',
          iyzico: {
            url: 'https://iyzi/pay/bp-tr-1',
            amount: 1575,
            currency: 'TRY',
          },
          stripe: {
            url: 'https://stripe/pay/bp-tr-1',
            amount: 45,
            currency: 'EUR',
          },
        });
      }),
    } as unknown as TSCommandBus;

    // Command+Strategy: araçlar registry'de; executor yalnız dispatch eder.
    const support = new AiToolSupport(commandBus, queryBus);
    const registry = new AiToolRegistry({} as DiscoveryService);
    registry.registerAll([
      new SearchTransfersTool(commandBus, queryBus, support),
      new BookTransferTool(commandBus, queryBus, support),
      new GetTransferBookingsTool(support),
      new CancelTransferBookingTool(commandBus, support),
    ]);

    return {
      executor: new AiToolExecutor(registry),
      commandBus,
      store,
    };
  };

  const call = (name: string, input: Record<string, unknown> = {}) => ({
    name,
    input,
  });

  it('search_transfers: havalimanı→klinik aranır, rateKey gizli kalır, optionId döner', async () => {
    const { executor, store } = build();
    const res = await executor.execute(
      call(AI_TOOL_NAMES.SEARCH_TRANSFERS, {
        direction: 'ARRIVAL',
        date: '2026-07-01',
        time: '14:00',
        adults: 2,
      }),
      context
    );
    const body = JSON.parse(res.content);
    expect(body.options).toHaveLength(1);
    const optionId = body.options[0].optionId;
    expect(optionId).toMatch(/^tr_/);
    expect(res.content).not.toContain('TR-RK-OPAQUE-1');
    expect(store.get(optionId)).toMatchObject({
      rateKey: 'TR-RK-OPAQUE-1',
      direction: 'ARRIVAL',
    });
  });

  it('config eksikse (havalimanı yok) yapılandırılmamış mesajı', async () => {
    const { executor } = build({
      config: { ...fullConfig, airportIata: null },
    });
    const res = await executor.execute(
      call(AI_TOOL_NAMES.SEARCH_TRANSFERS, {
        direction: 'ARRIVAL',
        date: '2026-07-01',
        time: '14:00',
        adults: 2,
      }),
      context
    );
    expect(res.content).toContain('yapılandırılmamış');
  });

  it('book_transfer: ödeme-önce — iki link, rateKey gizli, intent uçuş detayı taşır, misafir lead’e bağlanır', async () => {
    const { executor, commandBus } = build();
    const search = await executor.execute(
      call(AI_TOOL_NAMES.SEARCH_TRANSFERS, {
        direction: 'ARRIVAL',
        date: '2026-07-01',
        time: '14:00',
        adults: 2,
      }),
      context
    );
    const optionId = JSON.parse(search.content).options[0].optionId;

    const res = await executor.execute(
      call(AI_TOOL_NAMES.BOOK_TRANSFER, {
        optionId,
        holderName: 'Ali',
        holderSurname: 'Veli',
        holderEmail: 'ali@example.com',
        holderPhone: '+905550001122',
        flightCode: 'TK1980',
      }),
      context
    );

    const body = JSON.parse(res.content);
    expect(body.paymentRequired).toBe(true);
    expect(body.tryLink.currency).toBe('TRY');
    expect(body.fxLink.currency).toBe('EUR');
    expect(res.content).not.toContain('TR-RK-OPAQUE-1');

    // Arama adımı CacheTransferRateOptionCommand da dispatch eder; ödeme komutunu ayıkla.
    const cmd = (commandBus.execute as jest.Mock).mock.calls
      .map((c) => c[0])
      .find(
        (c) => c instanceof InitiateBookingPaymentCommand
      ) as InitiateBookingPaymentCommand;
    expect(cmd).toBeInstanceOf(InitiateBookingPaymentCommand);
    expect(cmd.input.bookingType).toBe('TRANSFER');
    expect(cmd.input.netAmount).toBe(45);
    const intent = cmd.input.intent as TransferBookingIntent;
    expect(intent.transfers[0].rateKey).toBe('TR-RK-OPAQUE-1');
    expect(intent.transfers[0].transferDetails[0].code).toBe('TK1980');
    expect(intent.transfers[0].transferDetails[0].direction).toBe('ARRIVAL');
    expect(cmd.input.leadId).toBe('lead-1');
    expect(cmd.input.patientId).toBeNull();
  });

  it('book_transfer: zorunlu alan (uçuş kodu) eksikse rezervasyon yapılmaz', async () => {
    const { executor, commandBus } = build();
    const search = await executor.execute(
      call(AI_TOOL_NAMES.SEARCH_TRANSFERS, {
        direction: 'ARRIVAL',
        date: '2026-07-01',
        time: '14:00',
        adults: 2,
      }),
      context
    );
    const optionId = JSON.parse(search.content).options[0].optionId;

    const res = await executor.execute(
      call(AI_TOOL_NAMES.BOOK_TRANSFER, {
        optionId,
        holderName: 'Ali',
        holderSurname: 'Veli',
        holderEmail: 'ali@example.com',
        holderPhone: '+905550001122',
        // flightCode eksik
      }),
      context
    );
    expect(res.content).toContain('uçuş numarası');
    // Arama adımı rate-option cache command'i dispatch eder; ödeme komutu dispatch EDİLMEZ.
    const paymentDispatched = (commandBus.execute as jest.Mock).mock.calls
      .map((c) => c[0])
      .some((c) => c instanceof InitiateBookingPaymentCommand);
    expect(paymentDispatched).toBe(false);
  });

  it('cancel_transfer_booking: yazışmaya ait olmayan referans reddedilir', async () => {
    const { executor, commandBus } = build({ bookings: [] });
    const res = await executor.execute(
      call(AI_TOOL_NAMES.CANCEL_TRANSFER_BOOKING, { reference: 'OTHER-REF' }),
      context
    );
    expect(res.content).toContain('doğrulayamadım');
    expect(commandBus.execute).not.toHaveBeenCalled();
  });
});
