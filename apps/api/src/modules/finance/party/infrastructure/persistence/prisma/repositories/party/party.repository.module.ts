import { Module } from '@nestjs/common';
import {
  PARTY_COMMAND_REPOSITORY,
  PARTY_QUERY_REPOSITORY,
} from '@modules/finance/party/domain/repositories/party.repository';
import { PartyCommandRepository } from './party.command.repository';
import { PartyQueryRepository } from './party.query.repository';

@Module({
  providers: [
    { provide: PARTY_COMMAND_REPOSITORY, useClass: PartyCommandRepository },
    { provide: PARTY_QUERY_REPOSITORY, useClass: PartyQueryRepository },
  ],
  exports: [PARTY_COMMAND_REPOSITORY, PARTY_QUERY_REPOSITORY],
})
export class PartyRepositoryModule {}
