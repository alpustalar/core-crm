import { Module } from '@nestjs/common';
import { PartyCommandModule } from './application/commands/command.module';
import { PartyQueryModule } from './application/queries/query.module';
import { PartyPresentationModule } from './presentation/party-presentation.module';

@Module({
  imports: [PartyCommandModule, PartyQueryModule, PartyPresentationModule],
  exports: [PartyCommandModule, PartyQueryModule],
})
export class PartyModule {}
