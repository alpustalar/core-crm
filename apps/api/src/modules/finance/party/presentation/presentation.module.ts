import { Module } from '@nestjs/common';
import { PartyController } from './controllers/party.controller';
import { PartyApplicationModule } from '@modules/finance/party/application/application.module';

@Module({
  imports: [PartyApplicationModule],
  controllers: [PartyController],
})
export class PartyPresentationModule {}
