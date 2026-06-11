import { Module } from '@nestjs/common';
import { EnsurePartyHandler } from './ensure-party/ensure-party.handler';
import { EnsurePartyForPatientHandler } from './ensure-party-for-patient/ensure-party-for-patient.handler';
import { PartyRepositoryModule } from '@modules/finance/party/infrastructure/persistence/prisma/repositories/party/party.repository.module';

const CommandHandlers = [EnsurePartyHandler, EnsurePartyForPatientHandler];

@Module({
  imports: [PartyRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class PartyCommandModule {}
