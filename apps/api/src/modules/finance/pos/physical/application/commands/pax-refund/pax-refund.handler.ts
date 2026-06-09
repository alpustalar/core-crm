import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PosTransactionStatus } from '@prisma/client';
import { PaxRefundCommand } from './pax-refund.command';
import type { PaxRefundResponse } from './pax-refund.response';
import {
  IPosDeviceQueryRepository,
  POS_DEVICE_QUERY_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-device.repository';
import {
  IPosTransactionCommandRepository,
  IPosTransactionQueryRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
  POS_TRANSACTION_QUERY_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import { PaxService } from '@modules/finance/pos/physical/infrastructure/providers/pax/pax.service';
import {
  PaxConnectionError,
  PaxTimeoutError,
} from '@modules/finance/pos/physical/infrastructure/providers/pax/pax.errors';

@CommandHandler(PaxRefundCommand)
export class PaxRefundHandler
  implements ICommandHandler<PaxRefundCommand, PaxRefundResponse>
{
  private readonly logger = new Logger(PaxRefundHandler.name);

  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceQueryRepo: IPosDeviceQueryRepository,
    @Inject(POS_TRANSACTION_QUERY_REPOSITORY)
    private readonly posTransactionQueryRepo: IPosTransactionQueryRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    private readonly paxService: PaxService
  ) {}

  async execute(command: PaxRefundCommand): Promise<PaxRefundResponse> {
    const { input } = command;

    const originalTx = await this.posTransactionQueryRepo.findById(
      input.originalPosTransactionId
    );
    if (!originalTx) {
      throw new NotFoundException('Orijinal POS işlemi bulunamadı.');
    }
    if (originalTx.status !== PosTransactionStatus.SUCCESS) {
      throw new BadRequestException(
        'Yalnızca başarılı işlemler iade edilebilir.'
      );
    }
    if (!originalTx.externalRef) {
      throw new BadRequestException(
        'Orijinal işlemin PAX referansı (HostRefNum) bulunamadı.'
      );
    }

    const refundAmount = input.amount ?? Number(originalTx.amount);

    if (refundAmount > Number(originalTx.amount)) {
      throw new BadRequestException(
        'İade tutarı orijinal işlem tutarını aşamaz.'
      );
    }

    const device = await this.posDeviceQueryRepo.findById(
      originalTx.posDeviceId
    );
    if (!device || !device.isActive) {
      throw new NotFoundException('POS cihazı bulunamadı veya aktif değil.');
    }

    const refundTransactionId = crypto.randomUUID();

    const refundTx = await this.posTransactionCommandRepo.create({
      id: refundTransactionId,
      posDeviceId: device.id,
      clinicId: input.clinicId,
      paymentId: originalTx.paymentId ?? undefined,
      amount: refundAmount,
      currency: originalTx.currency,
    });

    try {
      const result = await this.paxService.refund({
        device: {
          host: device.host,
          port: device.port,
          terminalId: device.terminalId,
          merchantId: device.merchantId,
        },
        amountInMinorUnits: Math.round(refundAmount * 100),
        ecReferenceNumber: refundTransactionId,
        originalReferenceNumber: originalTx.externalRef,
      });

      if (result.approved) {
        refundTx.markSuccess(result.externalRef, result.rawResponse);
      } else {
        refundTx.markFailed(result.rawResponse);
      }
      await this.posTransactionCommandRepo.save(refundTx);

      const status = result.approved
        ? PosTransactionStatus.SUCCESS
        : PosTransactionStatus.FAILED;

      this.logger.log(
        `PAX iade tamamlandı: id=${refundTransactionId} status=${status}`
      );

      return {
        posTransactionId: refundTransactionId,
        status,
        approved: result.approved,
        responseText: result.responseText,
        authorizationCode: result.authorizationCode,
        externalRef: result.externalRef,
      };
    } catch (err) {
      if (err instanceof PaxTimeoutError) {
        this.logger.warn(
          `PAX iade timeout: id=${refundTransactionId} — PENDING kalıyor`
        );
        return { posTransactionId: refundTransactionId, status: 'PENDING' };
      }

      if (err instanceof PaxConnectionError) {
        refundTx.markFailed();
        await this.posTransactionCommandRepo.save(refundTx);
        this.logger.error(
          `PAX iade bağlantı hatası: id=${refundTransactionId}`
        );
        return { posTransactionId: refundTransactionId, status: 'FAILED' };
      }

      throw err;
    }
  }
}
