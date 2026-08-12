import { Module } from '@nestjs/common';
import { PartyQueryController } from '@modules/finance/party/presentation/http/controllers/party.query.controller';

@Module({ controllers: [PartyQueryController] })
export class PartyPresentationModule {}
