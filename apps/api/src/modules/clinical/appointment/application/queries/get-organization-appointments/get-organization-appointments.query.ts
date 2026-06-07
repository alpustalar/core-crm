import { GetOrganizationAppointments } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetOrganizationAppointmentsQueryResponse } from '@modules/clinical/appointment/application/queries/get-organization-appointments/get-organization-appointments.response';
import { IQuery } from '@nestjs/cqrs';

export class GetOrganizationAppointmentsQuery implements IQuery {
  readonly __responseType!: GetOrganizationAppointmentsQueryResponse;
  constructor(
    public readonly dto: GetOrganizationAppointments,
    public readonly ctx: IGetContext
  ) {}
}
