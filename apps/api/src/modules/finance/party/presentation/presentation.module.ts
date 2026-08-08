import { Module } from '@nestjs/common';
import { PartyController } from '@modules/finance/party/presentation/http/controllers/party.controller';

@Module({ controllers: [PartyController] })
export class PartyPresentationModule {}
