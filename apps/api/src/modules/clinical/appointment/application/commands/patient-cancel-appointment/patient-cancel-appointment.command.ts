import { CancelAppointmentDto } from '@shared/modules/appointment/dto/commands/cancel-appointment.dto';
import { ICommand } from '@nestjs/cqrs';
import { PatientCancelAppointmentResponse } from '@modules/clinical/appointment/application/commands/patient-cancel-appointment/patient-cancel-appointment.response';
import { IGetPatientContext } from '@common/decorators/get-patient-context.decorator';

export class PatientCancelAppointmentCommand implements ICommand {
  readonly __responseType!: PatientCancelAppointmentResponse;
  constructor(
    public readonly dto: CancelAppointmentDto,
    public readonly ctx: IGetPatientContext
  ) {}
}
