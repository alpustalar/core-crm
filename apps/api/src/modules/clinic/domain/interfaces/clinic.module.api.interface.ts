import { IGetContext } from '@common/decorators/get-context.decorator';
import { QueryResponse } from '@shared/common/response/response.interface';
import { FindClinicAvailabilityByDayResponse } from '@modules/clinic/application/queries/find-clinic-availability-by-day/find-clinic-availability-by-day.response';
import { Clinic, CreateClinicDto } from '@shared';

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
  ): Promise<QueryResponse<FindClinicAvailabilityByDayResponse>>;
  findManyByOrganizationId(organizationId: string): Promise<Clinic[]>;
  assertCanBookOrThrow(input: AssertClinicCanBookInput): Promise<void>;
  create(dto: CreateClinicDto, context: IGetContext): Promise<string | null>;
}
