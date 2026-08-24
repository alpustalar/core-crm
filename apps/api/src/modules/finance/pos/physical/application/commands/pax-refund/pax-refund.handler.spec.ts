import { PaxRefundHandler } from './pax-refund.handler';
import { PaxRefundCommand } from './pax-refund.command';
import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';
import { PosDevice } from '@modules/finance/pos/physical/domain/entities/pos-device.entity';
import { IPosTransactionCommandRepository } from '@modules/finance/pos/physical/domain/repositories/pos-transaction/pos-transaction.command.repository';
import { IPosDeviceCommandRepository } from '@modules/finance/pos/physical/domain/repositories/pos-device/pos-device.command.repository';
import { PosTransactionReversalSummary } from '@modules/finance/pos/physical/domain/contracts/pos-transaction';
import {
  PosTransactionAlreadyReversedException,
  RefundAmountExceedsOriginalException,
} from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';
import { PaxService } from '@src/infrastructure/payment/pos/physical/providers/pax/pax.service';
import { PosPaymentSyncService } from '@modules/finance/pos/physical/application/services/pos-payment-sync.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { IGetContext } from '@common/decorators';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import PosTransactionKindSchema from '@input-type-schemas/PosTransactionKindSchema';
import CurrencySchema from '@input-type-schemas/CurrencySchema';
import { Decimal } from 'decimal.js';

describe('PaxRefundHandler — iade (kilit + kümülatif tutar)', () => {
  const CLINIC_ID = '11111111-1111-4111-8111-111111111111';
  const DEVICE_ID = '22222222-2222-4222-8222-222222222222';
  const SALE_AMOUNT = 100;

  const ctx: IGetContext = {
    actor: { userId: 'user-1', clinicId: CLINIC_ID } as IGetContext['actor'],
    source: ExecutionSources.USER_ACTION,
  };

  const makeSuccessfulSale = (): PosTransaction => {
    const sale = PosTransaction.create({
      posDeviceId: DEVICE_ID,
      clinicId: CLINIC_ID,
      amount: SALE_AMOUNT,
      currency: CurrencySchema.enum.TRY,
    });
    sale.markSuccess('HOSTREF-ORIGINAL');
    return sale;
  };

  const makeDevice = (): PosDevice =>
    PosDevice.create({
      id: DEVICE_ID,
      clinicId: CLINIC_ID,
      label: 'Kasa 1',
      provider: 'PAX',
      terminalId: 'T1',
      merchantId: 'M1',
      host: '127.0.0.1',
      port: 10009,
    });

  const noReversal: PosTransactionReversalSummary = {
    hasActiveVoid: false,
    refundedAmount: new Decimal(0),
  };

  const build = (
    sale: PosTransaction,
    reversal: PosTransactionReversalSummary = noReversal
  ) => {
    let txDepth = 0;
    const depthAtCall: Record<string, number> = {};

    const findByIdForUpdate = jest.fn(() => {
      depthAtCall.loadOriginal = txDepth;
      return Promise.resolve(sale);
    });
    const findLiveReversalSummary = jest.fn(() => {
      depthAtCall.reversalCheck = txDepth;
      return Promise.resolve(reversal);
    });
    const created: PosTransaction[] = [];
    const create = jest.fn((entity: PosTransaction) => {
      created.push(entity);
      return Promise.resolve(entity);
    });
    const update = jest.fn((entity: PosTransaction) => Promise.resolve(entity));

    // Kilitsiz `findById` bilerek tanımsız: handler kullanırsa test patlar.
    const posTransactionRepo = {
      findByIdForUpdate,
      findLiveReversalSummary,
      create,
      update,
    } as unknown as IPosTransactionCommandRepository;

    const posDeviceRepo = {
      findById: jest.fn(() => Promise.resolve(makeDevice())),
    } as unknown as IPosDeviceCommandRepository;

    const refundCall = jest.fn(() => {
      depthAtCall.device = txDepth;
      return Promise.resolve({
        approved: true,
        responseCode: '00',
        responseText: 'APPROVED',
        externalRef: 'HOSTREF-REFUND',
        rawResponse: {},
      });
    });
    const paxService = { refund: refundCall } as unknown as PaxService;

    const runInTx = async (cb: () => Promise<unknown>) => {
      txDepth++;
      try {
        return await cb();
      } finally {
        txDepth--;
      }
    };
    const txManager = {
      outboxRun: jest.fn(runInTx),
      run: jest.fn(runInTx),
    } as unknown as TransactionManager;

    const posPaymentSync = {
      markRefunded: jest.fn(() => Promise.resolve()),
    } as unknown as PosPaymentSyncService;

    // Kiracı kapsamı kontrolü: aktör bu kliniğe erişebiliyor kabul edilir.
    // Reddedilme yolu ayrı testte doğrulanıyor.
    const policyFactory = {
      finance: jest.fn().mockReturnValue({
        evaluator: {
          check: jest.fn().mockReturnValue({ orThrow: () => undefined }),
        },
      }),
    } as never;

    return {
      handler: new PaxRefundHandler(
        posDeviceRepo,
        posTransactionRepo,
        paxService,
        txManager,
        posPaymentSync,
        policyFactory
      ),
      posTransactionRepo,
      findByIdForUpdate,
      findLiveReversalSummary,
      created,
      refundCall,
      depthAtCall,
    };
  };

  const commandFor = (sale: PosTransaction, amount?: number) =>
    new PaxRefundCommand(
      {
        originalPosTransactionId: sale.id.value,
        clinicId: CLINIC_ID,
        amount,
      },
      ctx
    );

  it('iade kaydı REFUND türünde, orijinale bağlı ama iptal kilidi tutmadan açılır', async () => {
    const sale = makeSuccessfulSale();
    const { handler, created } = build(sale);

    await handler.execute(commandFor(sale, 40));

    expect(created[0].kind).toBe(PosTransactionKindSchema.enum.REFUND);
    expect(created[0].originalPosTransactionId).toBe(sale.id.value);
    // Kısmi iadeler çoklu olabilir; iade DB kilidini tutmaz.
    expect(created[0].activeVoidOriginalId).toBeNull();
  });

  it('kalan tutar kadar ikinci kısmi iade yapılabilir', async () => {
    const sale = makeSuccessfulSale();
    const { handler, created, refundCall } = build(sale, {
      hasActiveVoid: false,
      refundedAmount: new Decimal(60),
    });

    await handler.execute(commandFor(sale, 40));

    expect(refundCall).toHaveBeenCalled();
    expect(created[0].amount.value.toNumber()).toBe(40);
  });

  it('kümülatif iade satış tutarını aşamaz — ikinci tam iade reddedilir', async () => {
    const sale = makeSuccessfulSale();
    const { handler, refundCall } = build(sale, {
      hasActiveVoid: false,
      refundedAmount: new Decimal(SALE_AMOUNT),
    });

    // Tek tek bakan eski kontrol bunu geçirirdi: 100 <= 100.
    await expect(
      handler.execute(commandFor(sale, SALE_AMOUNT))
    ).rejects.toBeInstanceOf(RefundAmountExceedsOriginalException);

    expect(refundCall).not.toHaveBeenCalled();
  });

  it('kısmi iadelerin toplamı satışı aşarsa reddedilir', async () => {
    const sale = makeSuccessfulSale();
    const { handler, refundCall } = build(sale, {
      hasActiveVoid: false,
      refundedAmount: new Decimal(70),
    });

    await expect(handler.execute(commandFor(sale, 40))).rejects.toBeInstanceOf(
      RefundAmountExceedsOriginalException
    );

    expect(refundCall).not.toHaveBeenCalled();
  });

  it('iptal edilmiş satış iade edilemez', async () => {
    const sale = makeSuccessfulSale();
    const { handler, refundCall } = build(sale, {
      hasActiveVoid: true,
      refundedAmount: new Decimal(0),
    });

    await expect(handler.execute(commandFor(sale, 10))).rejects.toBeInstanceOf(
      PosTransactionAlreadyReversedException
    );

    expect(refundCall).not.toHaveBeenCalled();
  });

  it('kararı besleyen okumalar kilitli, cihaz çağrısı transaction dışında', async () => {
    const sale = makeSuccessfulSale();
    const {
      handler,
      posTransactionRepo,
      findByIdForUpdate,
      findLiveReversalSummary,
      depthAtCall,
    } = build(sale);

    await handler.execute(commandFor(sale));

    expect(findByIdForUpdate).toHaveBeenCalledWith(sale.id.value);
    expect(findLiveReversalSummary).toHaveBeenCalledWith(sale.id.value);
    expect(
      (posTransactionRepo as { findById?: unknown }).findById
    ).toBeUndefined();
    expect(depthAtCall.loadOriginal).toBe(1);
    expect(depthAtCall.reversalCheck).toBe(1);
    expect(depthAtCall.device).toBe(0);
  });

  it('cihaza gönderilen tutar kuruş cinsinden doğrudur (Money → NaN değil)', async () => {
    const sale = makeSuccessfulSale();
    const { handler, refundCall } = build(sale);

    await handler.execute(commandFor(sale, 12.34));

    expect(refundCall).toHaveBeenCalledWith(
      expect.objectContaining({ amountInMinorUnits: 1234 })
    );
  });
});
