import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { PaxSaleCommand } from './pax-sale.command';
import type { PaxSaleResponse } from './pax-sale.response';
import {
  IPosDeviceQueryRepository,
  POS_DEVICE_QUERY_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-device.repository';
import {
  IPosTransactionCommandRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import { PaxService } from '@modules/finance/pos/physical/infrastructure/providers/pax/pax.service';
import {
  PaxConnectionError,
  PaxTimeoutError,
} from '@modules/finance/pos/physical/infrastructure/providers/pax/pax.errors';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { CreatePaymentCommand } from '@modules/finance/payment/application/commands/create-payment/create-payment.command';
import PaymentMethodSchema from '@input-type-schemas/PaymentMethodSchema';
import PosTransactionStatusSchema from '@input-type-schemas/PosTransactionStatusSchema';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { PosPaymentSyncService } from '@modules/finance/pos/physical/application/services/pos-payment-sync.service';

@CommandHandler(PaxSaleCommand)
export class PaxSaleHandler implements ICommandHandler<
  PaxSaleCommand,
  PaxSaleResponse
> {
  private readonly logger = new Logger(PaxSaleHandler.name);

  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceQueryRepo: IPosDeviceQueryRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    private readonly paxService: PaxService,
    private readonly commandBus: TSCommandBus,
    private readonly txManager: TransactionManager,
    private readonly posPaymentSync: PosPaymentSyncService
  ) {}

  async execute(command: PaxSaleCommand): Promise<PaxSaleResponse> {
    const { input } = command;

    const device = await this.posDeviceQueryRepo.findById(input.posDeviceId);
    if (!device || !device.isActive) {
      throw new NotFoundException('POS cihazı bulunamadı veya aktif değil.');
    }

    // Faz 1 — ödeme kaydı + PENDING işlem atomik olarak oluşturulur (TCP öncesi)
    const { posTransactionId, transaction, paymentId } =
      await this.txManager.outboxRun(async () => {
        let resolvedPaymentId = input.paymentId;
        if (!resolvedPaymentId && input.patientId) {
          const result = await this.commandBus.execute(
            new CreatePaymentCommand({
              clinicId: input.clinicId,
              patientId: input.patientId,
              appointmentId: input.appointmentId,
              amount: input.amount,
              currency: input.currency,
              method: PaymentMethodSchema.enum.CREDIT_CARD,
            })
          );
          resolvedPaymentId = result.paymentId;
        }

        const id = crypto.randomUUID();
        const tx = await this.posTransactionCommandRepo.create({
          id,
          posDeviceId: device.id,
          clinicId: input.clinicId,
          patientId: input.patientId,
          appointmentId: input.appointmentId,
          paymentId: resolvedPaymentId,
          amount: input.amount,
          currency: input.currency,
        });
        return {
          posTransactionId: id,
          transaction: tx,
          paymentId: resolvedPaymentId,
        };
      });

    // Faz 2 — PAX TCP çağrısı (transaction dışında; bloke edici, ~90s)
    try {
      const result = await this.paxService.sale({
        device: {
          host: device.host,
          port: device.port,
          terminalId: device.terminalId,
          merchantId: device.merchantId,
        },
        amountInMinorUnits: Math.round(input.amount * 100),
        ecReferenceNumber: posTransactionId,
      });

      // Faz 3 — sonuç + payment senkron + ledger atomik (outboxRun)
      await this.txManager.outboxRun(async () => {
        if (result.approved) {
          transaction.markSuccess(result.externalRef, result.rawResponse);
          await this.posTransactionCommandRepo.save(transaction);
          if (paymentId) {
            await this.posPaymentSync.markPaid({
              paymentId,
              clinicId: input.clinicId,
            });
          }
        } else {
          transaction.markFailed(result.rawResponse);
          await this.posTransactionCommandRepo.save(transaction);
          if (paymentId) {
            await this.posPaymentSync.markFailed({
              paymentId,
              clinicId: input.clinicId,
              reason: result.responseText,
            });
          }
        }
      });

      const status = result.approved
        ? PosTransactionStatusSchema.enum.SUCCESS
        : PosTransactionStatusSchema.enum.FAILED;

      this.logger.log(
        `PAX satış tamamlandı: id=${posTransactionId} status=${status}`
      );

      return {
        posTransactionId,
        status,
        approved: result.approved,
        responseText: result.responseText,
        authorizationCode: result.authorizationCode,
        externalRef: result.externalRef,
        maskedCardNumber: result.maskedCardNumber,
        cardType: result.cardType,
      };
    } catch (err) {
      if (err instanceof PaxTimeoutError) {
        this.logger.warn(
          `PAX satış timeout: id=${posTransactionId} — PENDING kalıyor`
        );
        return {
          posTransactionId,
          status: PosTransactionStatusSchema.enum.PENDING,
        };
      }

      if (err instanceof PaxConnectionError) {
        await this.txManager.outboxRun(async () => {
          transaction.markFailed();
          await this.posTransactionCommandRepo.save(transaction);
          if (paymentId) {
            await this.posPaymentSync.markFailed({
              paymentId,
              clinicId: input.clinicId,
              reason: 'POS cihazına bağlanılamadı',
            });
          }
        });
        this.logger.error(`PAX satış bağlantı hatası: id=${posTransactionId}`);
        return {
          posTransactionId,
          status: PosTransactionStatusSchema.enum.FAILED,
        };
      }

      throw err;
    }
  }
}
