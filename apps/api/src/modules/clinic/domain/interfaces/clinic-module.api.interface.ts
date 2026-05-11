import { IGetContext } from '@common/decorators/get-context.decorator';
import { IClinic } from '../repositories/clinic.repository.interface';
import { QueryResult } from '@shared/common/response/response.interface';
import { FindClinicAvailabilityByDayOutput } from '@modules/clinic/application/use-cases/queries';

export const CLINIC_MODULE_API_TOKEN = Symbol('IClinicModuleApi');

export interface AssertClinicCanBookInput {
  clinicId: string;
  startTime: Date;
  endTime: Date;
}

export interface FindScheduleInput {
  clinicId: string;
  startDate: Date;
  endDate: Date;
}

export interface IClinicModuleApi {
  softDeleteManyWithAnOrganizationId(
    organizationId: string,
    context?: IGetContext
  ): Promise<void>;
  findAvailabilityByDay(
    clinicId: string,
    date: Date
  ): Promise<QueryResult<FindClinicAvailabilityByDayOutput>>;
  findManyByOrganizationId(organizationId: string): Promise<IClinic[]>;
  assertCanBook(input: AssertClinicCanBookInput): Promise<void>;
}
