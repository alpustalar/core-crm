import { Module } from '@nestjs/common';
import { PartyCommandRepository } from './party.command.repository';
import { PartyQueryRepository } from './party.query.repository';
import { PARTY_COMMAND_REPOSITORY } from '@modules/finance/party/domain/repositories/party/party.command.repository';
import { PARTY_QUERY_REPOSITORY } from '@modules/finance/party/domain/repositories/party/party.query.repository';

@Module({
  providers: [
    { provide: PARTY_COMMAND_REPOSITORY, useClass: PartyCommandRepository },
    { provide: PARTY_QUERY_REPOSITORY, useClass: PartyQueryRepository },
  ],
  exports: [PARTY_COMMAND_REPOSITORY, PARTY_QUERY_REPOSITORY],
})
export class PartyRepositoryModule {}
