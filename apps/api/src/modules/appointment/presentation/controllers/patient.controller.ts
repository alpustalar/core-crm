import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { PatientGuard } from '@modules/patient-auth/guards/patient.guard';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { PatientCancelAppointmentCommand } from '@modules/appointment/application/commands/patient-cancel-appointment/patient-cancel-appointment.command';
import { CancelAppointmentDto } from '@shared/modules/appointment/dto/commands/cancel-appointment.dto';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@Controller('patient')
export class PatientController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Patch('cancel')
  @UseGuards(PatientGuard)
  cancelAppointment(
    @Body() dto: CancelAppointmentDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new PatientCancelAppointmentCommand(dto, ctx)
    );
  }
}
