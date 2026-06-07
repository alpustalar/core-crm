import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { HandlePosCallbackCommand } from './handle-pos-callback.command';
import { HandlePosCallbackResponse } from './handle-pos-callback.response';
import {
  IPosTransactionCommandRepository,
  IPosTransactionQueryRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
  POS_TRANSACTION_QUERY_REPOSITORY,
} from '@modules/finance/pos/domain/repositories/pos-transaction.repository';
import {
  IPhysicalPosProvider,
  PHYSICAL_POS_PROVIDER,
} from '@modules/finance/pos/domain/interfaces/physical-pos-provider.interface';
import { PosTransactionStatus } from '@prisma/client';

const STATUS_MAP: Record<string, PosTransactionStatus> = {
  SUCCESS: PosTransactionStatus.SUCCESS,
  FAILED: PosTransactionStatus.FAILED,
  CANCELLED: PosTransactionStatus.CANCELLED,
  TIMEOUT: PosTransactionStatus.TIMEOUT,
};

@CommandHandler(HandlePosCallbackCommand)
export class HandlePosCallbackHandler
  implements
    ICommandHandler<HandlePosCallbackCommand, HandlePosCallbackResponse>
{
  private readonly logger = new Logger(HandlePosCallbackHandler.name);

  constructor(
    @Inject(POS_TRANSACTION_QUERY_REPOSITORY)
    private readonly posTransactionQueryRepo: IPosTransactionQueryRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    @Inject(PHYSICAL_POS_PROVIDER)
    private readonly posProvider: IPhysicalPosProvider
  ) {}

  async execute(
    command: HandlePosCallbackCommand
  ): Promise<HandlePosCallbackResponse> {
    const { input } = command;

    const result = await this.posProvider.parseCallback({
      externalRef: input.externalRef,
      rawResponse: input.rawPayload,
    });

    const transaction = await this.posTransactionQueryRepo.findByExternalRef(
      input.externalRef
    );
    if (!transaction) {
      throw new NotFoundException(
        `POS işlemi bulunamadı: externalRef=${input.externalRef}`
      );
    }

    const status = STATUS_MAP[result.status] ?? PosTransactionStatus.FAILED;

    await this.posTransactionCommandRepo.updateStatus({
      id: transaction.id,
      status,
      rawResponse: result.rawResponse,
      completedAt: ['SUCCESS', 'FAILED', 'CANCELLED', 'TIMEOUT'].includes(
        result.status
      )
        ? new Date()
        : undefined,
    });

    this.logger.log(
      `POS işlemi güncellendi: id=${transaction.id} status=${status}`
    );

    return { posTransactionId: transaction.id, status };
  }
}
