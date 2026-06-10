import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPartyCommandRepository,
  IPartyQueryRepository,
  PARTY_COMMAND_REPOSITORY,
  PARTY_QUERY_REPOSITORY,
} from '@modules/finance/party/domain/repositories/party.repository';
import { Party } from '@modules/finance/party/domain/entities/party.entity';
import { EnsurePartyCommand } from './ensure-party.command';

@CommandHandler(EnsurePartyCommand)
export class EnsurePartyHandler
  implements ICommandHandler<EnsurePartyCommand, string>
{
  constructor(
    @Inject(PARTY_COMMAND_REPOSITORY)
    private readonly partyCommandRepo: IPartyCommandRepository,
    @Inject(PARTY_QUERY_REPOSITORY)
    private readonly partyQueryRepo: IPartyQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: EnsurePartyCommand): Promise<string> {
    const { input } = command;

    const existing = await this.partyQueryRepo.findByOrigin(
      input.organizationId,
      input.originType,
      input.originId
    );

    if (existing) {
      existing.addRole(input.role);
      existing.updateSnapshot({
        name: input.name,
        taxNumber: input.taxNumber ?? undefined,
        nationalId: input.nationalId ?? undefined,
        taxOffice: input.taxOffice ?? undefined,
        email: input.email ?? undefined,
        phone: input.phone ?? undefined,
        address: input.address ?? undefined,
      });
      await this.txManager.run(() => this.partyCommandRepo.save(existing));
      return existing.id;
    }

    const party = Party.create({
      organizationId: input.organizationId,
      type: input.type,
      roles: [input.role],
      name: input.name,
      taxNumber: input.taxNumber,
      nationalId: input.nationalId,
      taxOffice: input.taxOffice,
      email: input.email,
      phone: input.phone,
      address: input.address,
      originType: input.originType,
      originId: input.originId,
    });

    try {
      await this.txManager.run(() => this.partyCommandRepo.save(party));
      return party.id;
    } catch (error) {
      // Eşzamanlı ensure çağrısı aynı origin için cari oluşturmuş olabilir
      // (organizationId+originType+originId unique). Bu durumda mevcut olanı döndür.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const raced = await this.partyQueryRepo.findByOrigin(
          input.organizationId,
          input.originType,
          input.originId
        );
        if (raced) return raced.id;
      }
      throw error;
    }
  }
}
