import { Module } from '@nestjs/common';
import { EnsurePartyHandler } from './ensure-party/ensure-party.handler';
import { PartyRepositoryModule } from '@modules/finance/party/infrastructure/persistence/prisma/repositories/party/party.repository.module';

const CommandHandlers = [EnsurePartyHandler];

@Module({
  imports: [PartyRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class PartyCommandModule {}
