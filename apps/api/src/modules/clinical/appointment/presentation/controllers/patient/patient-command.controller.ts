import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';

import { PatientCancelAppointmentCommand } from '@modules/clinical/appointment/application/commands/patient-cancel-appointment/patient-cancel-appointment.command';
import { PatientBookAppointmentCommand } from '@modules/clinical/appointment/application/commands/patient-book-appointment/patient-book-appointment.command';
import { CancelAppointmentDto } from '@shared/modules/appointment/dto/commands/cancel-appointment.dto';
import { PatientBookAppointmentDto } from '@shared/modules/patients/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { Public } from '@common/decorators/public.decorator';
import {
  GetPatientContext,
  IGetPatientContext,
} from '@common/decorators/get-patient-context.decorator';
import { GetContext } from '@common/decorators';
import { PatientGuard } from '@modules/identity/auth/patient-auth/guards/patient.guard';

@UseGuards(PatientGuard)
@Controller('patient')
export class PatientCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Public()
  @Post('book')
  async bookAppointment(
    @Body() dto: PatientBookAppointmentDto,
    @GetPatientContext() ctx: IGetPatientContext
  ) {
    return this.commandBus.execute(
      new PatientBookAppointmentCommand({
        data: dto,
        ctx,
      })
    );
  }

  @Patch('cancel')
  @UseGuards(PatientGuard)
  cancelAppointment(
    @Body() dto: CancelAppointmentDto,
    @GetContext() ctx: IGetPatientContext
  ) {
    return this.commandBus.execute(
      new PatientCancelAppointmentCommand(dto, ctx)
    );
  }
}
