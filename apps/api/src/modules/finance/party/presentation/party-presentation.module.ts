import { Module } from '@nestjs/common';
import { PartyController } from './controllers/party.controller';
import { PartyQueryModule } from '@modules/finance/party/application/queries/query.module';

@Module({
  imports: [PartyQueryModule],
  controllers: [PartyController],
})
export class PartyPresentationModule {}
