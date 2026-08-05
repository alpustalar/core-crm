import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPartyCommandRepository,
  IPartyQueryRepository,
  PARTY_COMMAND_REPOSITORY,
  PARTY_QUERY_REPOSITORY,
} from '@modules/finance/party/domain/repositories/party.repository';
import { Party } from '@modules/finance/party/domain/entities/party.entity';
import { EnsurePartyCommand } from './ensure-party.command';
import { normalizeArray } from '@common/utils/normalize-array';
import { PartyAlreadyExistsError } from '@modules/finance/party/domain/exceptions/party.exceptions';

@CommandHandler(EnsurePartyCommand)
export class EnsurePartyHandler implements ICommandHandler<
  EnsurePartyCommand,
  string
> {
  constructor(
    @Inject(PARTY_COMMAND_REPOSITORY)
    private readonly partyCommandRepo: IPartyCommandRepository,
    @Inject(PARTY_QUERY_REPOSITORY)
    private readonly partyQueryRepo: IPartyQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: EnsurePartyCommand): Promise<string> {
    const { input } = command;

    const ExistingParty = await this.partyQueryRepo.findByOrigin(
      input.clinicId,
      input.originType,
      input.originId
    );

    if (ExistingParty) {
      ExistingParty.ensure(input);
      await this.txManager.run(() =>
        this.partyCommandRepo.update(ExistingParty)
      );
      return ExistingParty.id.value;
    }

    const party = Party.create({ ...input, roles: normalizeArray(input.role) });

    try {
      await this.txManager.run(() => this.partyCommandRepo.create(party));
      return party.id.value;
    } catch (error) {
      // Eşzamanlı ensure çağrısı aynı origin için cari oluşturmuş olabilir
      // (clinicId+originType+originId unique). Bu durumda mevcut olanı döndür.
      if (error instanceof PartyAlreadyExistsError) {
        const raced = await this.partyQueryRepo.findByOrigin(
          input.clinicId,
          input.originType,
          input.originId
        );
        if (raced) return raced.id.value;
      }
      throw error;
    }
  }
}
