import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { IyzicoTransactionStatus } from '@prisma/client';
import { HandlePaymentCallbackHandler } from './handle-payment-callback.handler';
import { HandlePaymentCallbackCommand } from './handle-payment-callback.command';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import {
  IIyzicoTransactionRepository,
  IYZICO_TRANSACTION_REPOSITORY,
  IyzicoTransactionWithInstallment,
} from '@src/infrastructure/payment/providers/iyzico/domain/interfaces/iyzico-transaction.repository.interface';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { PAYMENT_EVENT_PUBLISHER } from '@modules/finance/payment/domain/interfaces/payment-event-publisher.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { PaymentDomainService } from '@modules/finance/payment/domain/services/payment-domain.service';

const makeTransaction = (
  status: IyzicoTransactionStatus = IyzicoTransactionStatus.INITIALIZE
): IyzicoTransactionWithInstallment =>
  ({
    id: 'tx-1',
    status,
    conversationId: 'conv-1',
    installment: {
      id: 'inst-1',
      payment: {
        id: 'pay-1',
        appointmentId: 'appt-1',
        clinicId: 'clinic-1',
      },
    },
  }) as IyzicoTransactionWithInstallment;

const makeCommand = () =>
  new HandlePaymentCallbackCommand('token-abc', 'conv-1', 'sig-xyz');

describe('HandlePaymentCallbackHandler', () => {
  let handler: HandlePaymentCallbackHandler;
  let iyzicoProvider: jest.Mocked<IIyzicoProvider>;
  let iyzicoRepo: jest.Mocked<IIyzicoTransactionRepository>;
  let paymentRepo: jest.Mocked<IPaymentRepository>;
  let paymentEventPublisher: {
    paymentPaid: jest.Mock;
    paymentFailed: jest.Mock;
  };

  beforeEach(async () => {
    const mockIyzicoProvider: jest.Mocked<IIyzicoProvider> = {
      retrieveCheckoutForm: jest.fn(),
      paymentInitialize: jest.fn(),
      refund: jest.fn(),
      getInstallmentInfo: jest.fn(),
      cancelPayment: jest.fn(),
      createSubMerchant: jest.fn(),
      updateSubMerchant: jest.fn(),
      callbackUrl: 'http://localhost/callback',
    };

    const mockIyzicoRepo: jest.Mocked<IIyzicoTransactionRepository> = {
      findTransactionByConversationId: jest.fn(),
      findByInstallmentId: jest.fn(),
      createTransaction: jest.fn(),
      markAsSuccess: jest.fn(),
      markAsFailed: jest.fn(),
      markAsRefunded: jest.fn(),
    };

    const mockPaymentRepo: Partial<jest.Mocked<IPaymentRepository>> = {
      markInstallmentAsPaid: jest.fn(),
      markInstallmentAsFailed: jest.fn(),
    };

    const mockPaymentEventPublisher = {
      paymentPaid: jest.fn(),
      paymentFailed: jest.fn(),
    };

    const mockTxManager = {
      outboxRun: jest
        .fn()
        .mockImplementation((cb: () => Promise<unknown>) => cb()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlePaymentCallbackHandler,
        PaymentDomainService,
        { provide: IYZICO_PROVIDER, useValue: mockIyzicoProvider },
        { provide: IYZICO_TRANSACTION_REPOSITORY, useValue: mockIyzicoRepo },
        { provide: PAYMENT_REPOSITORY, useValue: mockPaymentRepo },
        {
          provide: PAYMENT_EVENT_PUBLISHER,
          useValue: mockPaymentEventPublisher,
        },
        { provide: TransactionManager, useValue: mockTxManager },
      ],
    }).compile();

    handler = module.get(HandlePaymentCallbackHandler);
    iyzicoProvider = module.get(IYZICO_PROVIDER);
    iyzicoRepo = module.get(IYZICO_TRANSACTION_REPOSITORY);
    paymentRepo = module.get(PAYMENT_REPOSITORY);
    paymentEventPublisher = module.get(PAYMENT_EVENT_PUBLISHER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('transaction not found', () => {
    it('throws NotFoundException', async () => {
      iyzicoProvider.retrieveCheckoutForm.mockResolvedValue({
        isSuccess: true,
      } as any);
      iyzicoRepo.findTransactionByConversationId.mockResolvedValue(null);

      await expect(handler.execute(makeCommand())).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('idempotency — already processed', () => {
    it('returns early without re-processing a SUCCESS transaction', async () => {
      iyzicoProvider.retrieveCheckoutForm.mockResolvedValue({
        isSuccess: true,
      } as any);
      iyzicoRepo.findTransactionByConversationId.mockResolvedValue(
        makeTransaction(IyzicoTransactionStatus.SUCCESS)
      );

      await handler.execute(makeCommand());

      expect(iyzicoRepo.markAsSuccess).not.toHaveBeenCalled();
      expect(paymentRepo.markInstallmentAsPaid).not.toHaveBeenCalled();
      expect(paymentEventPublisher.paymentPaid).not.toHaveBeenCalled();
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
      iyzicoRepo.findTransactionByConversationId.mockResolvedValue(
        makeTransaction()
      );
      iyzicoRepo.markAsSuccess.mockResolvedValue({} as any);
      paymentRepo.markInstallmentAsPaid.mockResolvedValue({} as any);
    });

    it('marks iyzico transaction as success with SDK data', async () => {
      await handler.execute(makeCommand());

      expect(iyzicoRepo.markAsSuccess).toHaveBeenCalledWith({
        iyzicoTransactionId: 'tx-1',
        iyzicoPaymentId: 'iyzico-pay-1',
        iyzicoPaymentTransactionId: 'iyzico-tx-item-1',
        rawResponse: sdkResult.rawResponse,
      });
    });

    it('marks installment as paid', async () => {
      await handler.execute(makeCommand());

      expect(paymentRepo.markInstallmentAsPaid).toHaveBeenCalledWith('inst-1');
    });

    it('publishes paymentPaid event with correct payload', async () => {
      await handler.execute(makeCommand());

      expect(paymentEventPublisher.paymentPaid).toHaveBeenCalledWith(
        expect.objectContaining({
          installmentId: 'inst-1',
          paymentId: 'pay-1',
          appointmentId: 'appt-1',
          clinicId: 'clinic-1',
        })
      );
    });

    it('does not call failure paths', async () => {
      await handler.execute(makeCommand());

      expect(iyzicoRepo.markAsFailed).not.toHaveBeenCalled();
      expect(paymentRepo.markInstallmentAsFailed).not.toHaveBeenCalled();
      expect(paymentEventPublisher.paymentFailed).not.toHaveBeenCalled();
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
      iyzicoRepo.findTransactionByConversationId.mockResolvedValue(
        makeTransaction()
      );
      iyzicoRepo.markAsFailed.mockResolvedValue({} as any);
      paymentRepo.markInstallmentAsFailed.mockResolvedValue({} as any);
    });

    it('marks iyzico transaction as failed with error details', async () => {
      await handler.execute(makeCommand());

      expect(iyzicoRepo.markAsFailed).toHaveBeenCalledWith({
        iyzicoTransactionId: 'tx-1',
        errorCode: '5007',
        errorMessage: 'Yetersiz bakiye',
        rawResponse: sdkResult.rawResponse,
      });
    });

    it('marks installment as failed', async () => {
      await handler.execute(makeCommand());

      expect(paymentRepo.markInstallmentAsFailed).toHaveBeenCalledWith(
        'inst-1'
      );
    });

    it('publishes paymentFailed event with correct payload', async () => {
      await handler.execute(makeCommand());

      expect(paymentEventPublisher.paymentFailed).toHaveBeenCalledWith(
        expect.objectContaining({
          installmentId: 'inst-1',
          paymentId: 'pay-1',
          appointmentId: 'appt-1',
          clinicId: 'clinic-1',
        })
      );
    });

    it('does not call success paths', async () => {
      await handler.execute(makeCommand());

      expect(iyzicoRepo.markAsSuccess).not.toHaveBeenCalled();
      expect(paymentRepo.markInstallmentAsPaid).not.toHaveBeenCalled();
      expect(paymentEventPublisher.paymentPaid).not.toHaveBeenCalled();
    });
  });
});
