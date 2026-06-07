import { GetClinicAppointmentsDto } from '@shared/modules/appointment/dto/queries/get-clinic-appointments.dto';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { PaginationDto } from '@shared';
import { IQuery } from '@nestjs/cqrs';
import { GetClinicAppointmentsQueryResponse } from '@modules/clinical/appointment/application/queries/get-clinic-appointments/get-clinic-appointments.response';

export class GetClinicAppointmentsQuery implements IQuery {
  readonly __responseType!: GetClinicAppointmentsQueryResponse;
  constructor(
    public readonly dto: GetClinicAppointmentsDto,
    public readonly pagination: PaginationDto,
    public readonly ctx: IGetContext
  ) {}
}
