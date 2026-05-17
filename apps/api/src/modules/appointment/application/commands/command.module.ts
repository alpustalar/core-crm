import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BookAppointmentHandler } from './book-appointment/book-appointment.handler';

const CommandHandlers = [
  BookAppointmentHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class AppointmentCommandModule {}