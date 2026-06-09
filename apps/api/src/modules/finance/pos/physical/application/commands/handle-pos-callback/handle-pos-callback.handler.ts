import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { HandlePosCallbackCommand } from './handle-pos-callback.command';
import { HandlePosCallbackResponse } from './handle-pos-callback.response';
import {
  IPosTransactionCommandRepository,
  IPosTransactionQueryRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
  POS_TRANSACTION_QUERY_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import {
  IPhysicalPosProvider,
  PHYSICAL_POS_PROVIDER,
} from '@modules/finance/pos/physical/domain/interfaces/physical-pos-provider.interface';

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

    switch (result.status) {
      case 'SUCCESS':
        transaction.markSuccess(undefined, result.rawResponse);
        break;
      case 'CANCELLED':
        transaction.markCancelled(result.rawResponse);
        break;
      case 'TIMEOUT':
        transaction.markTimeout();
        break;
      default:
        transaction.markFailed(result.rawResponse);
    }

    await this.posTransactionCommandRepo.save(transaction);

    this.logger.log(
      `POS işlemi güncellendi: id=${transaction.id} status=${transaction.status}`
    );

    return { posTransactionId: transaction.id, status: transaction.status };
  }
}
