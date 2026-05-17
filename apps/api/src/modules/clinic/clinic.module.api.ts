import { Inject, Injectable } from '@nestjs/common';
import { SoftDeleteClinicsByOrganizationIdUseCase } from '@modules/clinic/application/use-cases/commands';
import {
  ClinicScheduleResult,
  FindClinicAvailabilityByDayOutput,
  FindClinicAvailabilityByDayUseCase,
  FindManyByOrganizationIdUseCase,
  GetClinicScheduleUseCase,
} from '@modules/clinic/application/use-cases/queries';
import { IClinic } from '@modules/clinic/domain/repositories/clinic.repository.interface';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { QueryResult } from '@shared/common/response/response.interface';
import {
  AssertClinicCanBookInput,
  FindScheduleInput,
  IClinicModuleApi,
} from '@modules/clinic/domain/interfaces/clinic-module.api.interface';
import { DateTimeManager } from '@common/utils/date-time.manager';
import {
  CLINIC_AVAILABILITY_DOMAIN_SERVICE_TOKEN,
  IClinicAvailabilityDomainService,
} from '@modules/clinic/domain/interfaces/clinic-availability.domain-service.interface';

@Injectable()
export class ClinicModuleApi implements IClinicModuleApi {
  constructor(
    private readonly softDeleteClinicsByOrganizationIdUseCase: SoftDeleteClinicsByOrganizationIdUseCase,
    private readonly findClinicAvailabilityByDayUseCase: FindClinicAvailabilityByDayUseCase,
    private readonly findManyByOrganizationIdUseCase: FindManyByOrganizationIdUseCase,
    private readonly getClinicScheduleUseCase: GetClinicScheduleUseCase,
    @Inject(CLINIC_AVAILABILITY_DOMAIN_SERVICE_TOKEN)
    private readonly clinicAvailabilityDomainService: IClinicAvailabilityDomainService
  ) {}

  async softDeleteManyWithAnOrganizationId(
    organizationId: string,
    context?: IGetContext
  ): Promise<void> {
    return await this.softDeleteClinicsByOrganizationIdUseCase.execute(
      organizationId,
      ExecutionContextFactory.createInternal(context?.source, context)
    );
  }

  findAvailabilityByDay(
    clinicId: string,
    date: Date
  ): Promise<QueryResult<FindClinicAvailabilityByDayOutput>> {
    return this.findClinicAvailabilityByDayUseCase.execute(clinicId, date);
  }

  findManyByOrganizationId(organizationId: string): Promise<IClinic[]> {
    return this.findManyByOrganizationIdUseCase.execute(organizationId);
  }

  findSchedule({
    clinicId,
    startDate,
    endDate,
  }: FindScheduleInput): Promise<ClinicScheduleResult> {
    return this.getClinicScheduleUseCase.execute({
      clinicId,
      startDate,
      endDate,
    });
  }

  async assertCanBook({
    clinicId,
    startTime,
    endTime,
  }: AssertClinicCanBookInput): Promise<void> {
    const { data: availability } =
      await this.findClinicAvailabilityByDayUseCase.execute(
        clinicId,
        startTime
      );

    const startMinute = DateTimeManager.getDayMinutes(startTime);
    const endMinute = DateTimeManager.getDayMinutes(endTime);

    this.clinicAvailabilityDomainService.validateTimeWithinClinicHoursOrThrow({
      startMinute,
      endMinute,
      clinicSchedule: availability,
    });
  }
}
