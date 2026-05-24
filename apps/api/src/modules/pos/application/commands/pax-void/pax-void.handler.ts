import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, Logger, NotFoundException } from '@nestjs/common';
import { PosTransactionStatus } from '@prisma/client';
import { PaxVoidCommand } from './pax-void.command';
import type { PaxVoidResponse } from './pax-void.response';
import {
  IPosDeviceQueryRepository,
  POS_DEVICE_QUERY_REPOSITORY,
} from '@modules/pos/domain/repositories/pos-device.repository';
import {
  IPosTransactionCommandRepository,
  IPosTransactionQueryRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
  POS_TRANSACTION_QUERY_REPOSITORY,
} from '@modules/pos/domain/repositories/pos-transaction.repository';
import { PaxService } from '@modules/pos/infrastructure/providers/pax/pax.service';
import {
  PaxConnectionError,
  PaxTimeoutError,
} from '@modules/pos/infrastructure/providers/pax/pax.errors';

@CommandHandler(PaxVoidCommand)
export class PaxVoidHandler implements ICommandHandler<PaxVoidCommand, PaxVoidResponse> {
  private readonly logger = new Logger(PaxVoidHandler.name);

  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceQueryRepo: IPosDeviceQueryRepository,
    @Inject(POS_TRANSACTION_QUERY_REPOSITORY)
    private readonly posTransactionQueryRepo: IPosTransactionQueryRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    private readonly paxService: PaxService,
  ) {}

  async execute(command: PaxVoidCommand): Promise<PaxVoidResponse> {
    const { input } = command;

    const originalTx = await this.posTransactionQueryRepo.findById(
      input.originalPosTransactionId,
    );
    if (!originalTx) {
      throw new NotFoundException('Orijinal POS işlemi bulunamadı.');
    }
    if (originalTx.status !== PosTransactionStatus.SUCCESS) {
      throw new BadRequestException('Yalnızca başarılı işlemler iptal edilebilir.');
    }
    if (!originalTx.externalRef) {
      throw new BadRequestException('Orijinal işlemin PAX referansı (HostRefNum) bulunamadı.');
    }

    const device = await this.posDeviceQueryRepo.findById(originalTx.posDeviceId);
    if (!device || !device.isActive) {
      throw new NotFoundException('POS cihazı bulunamadı veya aktif değil.');
    }

    const voidTransactionId = crypto.randomUUID();

    await this.posTransactionCommandRepo.create({
      id: voidTransactionId,
      posDeviceId: device.id,
      clinicId: input.clinicId,
      paymentId: originalTx.paymentId ?? undefined,
      amount: Number(originalTx.amount),
      currency: originalTx.currency,
    });

    try {
      const result = await this.paxService.void({
        device: {
          host: device.host,
          port: device.port,
          terminalId: device.terminalId,
          merchantId: device.merchantId,
        },
        ecReferenceNumber: voidTransactionId,
        originalReferenceNumber: originalTx.externalRef,
      });

      const status = result.approved
        ? PosTransactionStatus.SUCCESS
        : PosTransactionStatus.FAILED;

      await this.posTransactionCommandRepo.updateStatus({
        id: voidTransactionId,
        status,
        externalRef: result.externalRef,
        rawResponse: result.rawResponse,
        completedAt: new Date(),
      });

      this.logger.log(`PAX void tamamlandı: id=${voidTransactionId} status=${status}`);

      return {
        posTransactionId: voidTransactionId,
        status,
        approved: result.approved,
        responseText: result.responseText,
        externalRef: result.externalRef,
      };
    } catch (err) {
      if (err instanceof PaxTimeoutError) {
        this.logger.warn(`PAX void timeout: id=${voidTransactionId} — PENDING kalıyor`);
        return { posTransactionId: voidTransactionId, status: 'PENDING' };
      }

      if (err instanceof PaxConnectionError) {
        await this.posTransactionCommandRepo.updateStatus({
          id: voidTransactionId,
          status: PosTransactionStatus.FAILED,
          completedAt: new Date(),
        });
        this.logger.error(`PAX void bağlantı hatası: id=${voidTransactionId}`);
        return { posTransactionId: voidTransactionId, status: 'FAILED' };
      }

      throw err;
    }
  }
}
