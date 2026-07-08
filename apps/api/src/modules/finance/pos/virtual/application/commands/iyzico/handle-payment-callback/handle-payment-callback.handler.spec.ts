import { Test, TestingModule } from '@nestjs/testing';

import { HandlePaymentCallbackHandler } from './handle-payment-callback.handler';
import { IyzicoTransactionNotFoundException } from '@modules/finance/pos/virtual/domain/exceptions/iyzico.exceptions';
import { HandlePaymentCallbackCommand } from './handle-payment-callback.command';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import {
  IIyzicoTransactionCommandRepository,
  IIyzicoTransactionQueryRepository,
  IYZICO_TRANSACTION_COMMAND_REPOSITORY,
  IYZICO_TRANSACTION_QUERY_REPOSITORY,
  IyzicoTransactionWithInstallment,
} from '@modules/finance/pos/virtual/domain/repositories/iyzico-transaction.repository.interface';
import { IyzicoTransaction } from '@modules/finance/pos/virtual/domain/entities/iyzico-transaction.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { MarkInstallmentAsPaidCommand } from '@modules/finance/payment/application/commands/mark-installment-as-paid/mark-installment-as-paid.command';
import { MarkInstallmentAsFailedCommand } from '@modules/finance/payment/application/commands/mark-installment-as-failed/mark-installment-as-failed.command';
import {
  IyzicoTransactionStatusSchema,
  IyzicoTransactionStatusType,
} from '@input-type-schemas/IyzicoTransactionStatusSchema';

const makeTransaction = (
  status: IyzicoTransactionStatusType = IyzicoTransactionStatusSchema.enum
    .INITIALIZE
): IyzicoTransactionWithInstallment =>
  ({
    id: 'tx-1',
    installmentId: 'inst-1',
    conversationId: 'conv-1',
    token: 'token-abc',
    iyzicoPaymentId: null,
    iyzicoPaymentTransactionId: null,
    rawResponse: null,
    status,
    errorCode: null,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    installment: {
      id: 'inst-1',
      amount: { toString: () => '1000.00' },
      method: 'CREDIT_CARD',
      payment: {
        id: 'pay-1',
        patientId: 'patient-1',
        appointmentId: 'appt-1',
        clinicId: 'clinic-1',
      },
    },
  }) as unknown as IyzicoTransactionWithInstallment;

const makeCommand = () =>
  new HandlePaymentCallbackCommand('token-abc', 'conv-1', 'sig-xyz');

describe('HandlePaymentCallbackHandler', () => {
  let handler: HandlePaymentCallbackHandler;
  let iyzicoProvider: jest.Mocked<IIyzicoProvider>;
  let iyzicoQueryRepo: jest.Mocked<IIyzicoTransactionQueryRepository>;
  let iyzicoCommandRepo: jest.Mocked<IIyzicoTransactionCommandRepository>;
  let commandBus: { execute: jest.Mock };

  beforeEach(async () => {
    const mockIyzicoProvider: jest.Mocked<IIyzicoProvider> = {
      retrieveCheckoutForm: jest.fn(),
      chargeWithSavedCard: jest.fn(),
      paymentInitialize: jest.fn(),
      refund: jest.fn(),
      getInstallmentInfo: jest.fn(),
      cancelPayment: jest.fn(),
      createSubMerchant: jest.fn(),
      updateSubMerchant: jest.fn(),
      callbackUrl: 'http://localhost/callback',
    };

    const mockIyzicoQueryRepo: jest.Mocked<IIyzicoTransactionQueryRepository> = {
      findTransactionByConversationId: jest.fn(),
      findByInstallmentId: jest.fn(),
    };

    const mockIyzicoCommandRepo: jest.Mocked<IIyzicoTransactionCommandRepository> =
      {
        save: jest.fn(async (e: IyzicoTransaction) => e),
      };

    const mockCommandBus = { execute: jest.fn().mockResolvedValue(undefined) };

    const mockTxManager = {
      outboxRun: jest
        .fn()
        .mockImplementation((cb: () => Promise<unknown>) => cb()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlePaymentCallbackHandler,
        { provide: IYZICO_PROVIDER, useValue: mockIyzicoProvider },
        {
          provide: IYZICO_TRANSACTION_QUERY_REPOSITORY,
          useValue: mockIyzicoQueryRepo,
        },
        {
          provide: IYZICO_TRANSACTION_COMMAND_REPOSITORY,
          useValue: mockIyzicoCommandRepo,
        },
        { provide: TransactionManager, useValue: mockTxManager },
        { provide: TSCommandBus, useValue: mockCommandBus },
        { provide: TSQueryBus, useValue: {} },
      ],
    }).compile();

    handler = module.get(HandlePaymentCallbackHandler);
    iyzicoProvider = module.get(IYZICO_PROVIDER);
    iyzicoQueryRepo = module.get(IYZICO_TRANSACTION_QUERY_REPOSITORY);
    iyzicoCommandRepo = module.get(IYZICO_TRANSACTION_COMMAND_REPOSITORY);
    commandBus = module.get(TSCommandBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('transaction not found', () => {
    it('throws IyzicoTransactionNotFoundException', async () => {
      iyzicoProvider.retrieveCheckoutForm.mockResolvedValue({
        isSuccess: true,
      } as any);
      iyzicoQueryRepo.findTransactionByConversationId.mockResolvedValue(null);

      await expect(handler.execute(makeCommand())).rejects.toThrow(
        IyzicoTransactionNotFoundException
      );
    });
  });

  describe('idempotency — already processed', () => {
    it('returns early without re-processing a SUCCESS transaction', async () => {
      iyzicoProvider.retrieveCheckoutForm.mockResolvedValue({
        isSuccess: true,
      } as any);
      iyzicoQueryRepo.findTransactionByConversationId.mockResolvedValue(
        makeTransaction(IyzicoTransactionStatusSchema.enum.SUCCESS)
      );

      await handler.execute(makeCommand());

      expect(iyzicoCommandRepo.save).not.toHaveBeenCalled();
      expect(commandBus.execute).not.toHaveBeenCalled();
    });
  });

  describe('success path', () => {
    const sdkResult = {
      isSuccess: true,
      paymentId: 'iyzico-pay-1',
      paymentTransactionId: 'iyzico-tx-item-1',
      errorCode: undefined,
      errorMessage: undefined,
      rawResponse: { raw: true },
    };

    beforeEach(() => {
      iyzicoProvider.retrieveCheckoutForm.mockResolvedValue(sdkResult);
      iyzicoQueryRepo.findTransactionByConversationId.mockResolvedValue(
        makeTransaction()
      );
    });

    it('saves iyzico transaction entity in SUCCESS state with SDK data', async () => {
      await handler.execute(makeCommand());

      expect(iyzicoCommandRepo.save).toHaveBeenCalledTimes(1);
      const saved = iyzicoCommandRepo.save.mock
        .calls[0][0] as IyzicoTransaction;
      expect(saved.status).toBe(IyzicoTransactionStatusSchema.enum.SUCCESS);
      expect(saved.iyzicoPaymentId).toBe('iyzico-pay-1');
      expect(saved.iyzicoPaymentTransactionId).toBe('iyzico-tx-item-1');
    });

    it('dispatches MarkInstallmentAsPaidCommand with details (event ownership payment modülünde)', async () => {
      await handler.execute(makeCommand());

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(MarkInstallmentAsPaidCommand)
      );
      const paidCmd = commandBus.execute.mock.calls
        .map((c) => c[0])
        .find((cmd) => cmd instanceof MarkInstallmentAsPaidCommand);
      expect(paidCmd).toMatchObject({
        installmentId: 'inst-1',
        details: 'Ödeme Başarılı',
      });
    });
  });

  describe('failure path', () => {
    const sdkResult = {
      isSuccess: false,
      paymentId: '' as string,
      paymentTransactionId: undefined,
      errorCode: '5007',
      errorMessage: 'Yetersiz bakiye',
      rawResponse: { raw: true },
    };

    beforeEach(() => {
      iyzicoProvider.retrieveCheckoutForm.mockResolvedValue(sdkResult);
      iyzicoQueryRepo.findTransactionByConversationId.mockResolvedValue(
        makeTransaction()
      );
    });

    it('saves iyzico transaction entity in FAILURE state with error details', async () => {
      await handler.execute(makeCommand());

      expect(iyzicoCommandRepo.save).toHaveBeenCalledTimes(1);
      const saved = iyzicoCommandRepo.save.mock
        .calls[0][0] as IyzicoTransaction;
      expect(saved.status).toBe(IyzicoTransactionStatusSchema.enum.FAILURE);
      expect(saved.errorCode).toBe('5007');
      expect(saved.errorMessage).toBe('Yetersiz bakiye');
    });

    it('dispatches MarkInstallmentAsFailedCommand with errorMessage as details', async () => {
      await handler.execute(makeCommand());

      const failedCmd = commandBus.execute.mock.calls
        .map((c) => c[0])
        .find((cmd) => cmd instanceof MarkInstallmentAsFailedCommand);
      expect(failedCmd).toMatchObject({
        installmentId: 'inst-1',
        details: 'Yetersiz bakiye',
      });
    });
  });
});
