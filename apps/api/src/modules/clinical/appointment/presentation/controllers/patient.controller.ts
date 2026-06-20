import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { PatientGuard } from '@modules/identity/auth/patient-auth/guards/patient.guard';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { PatientCancelAppointmentCommand } from '@modules/clinical/appointment/application/commands/patient-cancel-appointment/patient-cancel-appointment.command';
import { PatientBookAppointmentCommand } from '@modules/clinical/appointment/application/commands/patient-book-appointment/patient-book-appointment.command';
import { CancelAppointmentDto } from '@shared/modules/appointment/dto/commands/cancel-appointment.dto';
import { PatientBookAppointmentDto } from '@shared/modules/patients/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { PatientAuthService } from '@modules/identity/auth/patient-auth/patient-auth.service';
import { Public } from '@common/decorators/public.decorator';

@Controller('patient')
export class PatientController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly patientAuthService: PatientAuthService
  ) {}

  @Public()
  @Post('book')
  async bookAppointment(@Body() dto: PatientBookAppointmentDto) {
    const patient = await this.patientAuthService.verifyAndRegister({
      idToken: dto.idToken,
      organizationId: dto.organizationId,
      firstName: dto.firstName,
    });
    return this.commandBus.execute(
      new PatientBookAppointmentCommand(dto, {
        patientId: patient.id,
        patientName: patient.firstName,
        patientPhone: patient.phone,
        patientEmail: patient.email,
      })
    );
  }

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
