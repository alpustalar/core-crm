import { Module } from '@nestjs/common';
import { AiAgentController } from './controllers/ai-agent.controller';
import { BookingConfirmedListener } from './controllers/booking-confirmed.listener';
import { AiAgentCommandModule } from '@modules/ai-agent/application/commands/command.module';
import { AiAgentQueryModule } from '@modules/ai-agent/application/queries/query.module';

@Module({
  imports: [AiAgentCommandModule, AiAgentQueryModule],
  // BookingConfirmedListener bir HTTP controller değil, NATS olay dinleyicisidir;
  // Nest her ikisini de `controllers` altında keşfeder.
  controllers: [AiAgentController, BookingConfirmedListener],
})
export class AiAgentPresentationModule {}
