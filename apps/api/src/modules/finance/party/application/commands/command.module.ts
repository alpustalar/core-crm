import { Module } from '@nestjs/common';
import { EnsurePartyHandler } from './ensure-party/ensure-party.handler';
import { EnsurePartyForPatientHandler } from './ensure-party-for-patient/ensure-party-for-patient.handler';
import { EnsurePartyForEmployeeHandler } from './ensure-party-for-employee/ensure-party-for-employee.handler';
import { PartyRepositoryModule } from '@modules/finance/party/infrastructure/persistence/prisma/repositories/party/party.repository.module';

const CommandHandlers = [
  EnsurePartyHandler,
  EnsurePartyForPatientHandler,
  EnsurePartyForEmployeeHandler,
];

@Module({
  imports: [PartyRepositoryModule],
  providers: [...CommandHandlers],
})
export class PartyCommandModule {}
