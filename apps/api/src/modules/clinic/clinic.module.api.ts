import { Inject, Injectable } from '@nestjs/common';

import { IGetContext } from '@common/decorators/get-context.decorator';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { QueryResponse } from '@shared/common/response/response.interface';
import {
  AssertClinicCanBookInput,
  FindScheduleInput,
  IClinicModuleApi,
} from '@modules/clinic/domain/interfaces/clinic.module.api.interface';
import { DateTimeManager } from '@common/utils/date-time.manager';
import {
  CLINIC_AVAILABILITY_DOMAIN_SERVICE_TOKEN,
  IClinicAvailabilityDomainService,
} from '@modules/clinic/domain/interfaces/clinic-availability.domain-service.interface';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  SoftDeleteManyClinicsByOrganizationIdCommand
} from '@modules/clinic/application/commands/soft-delete-many-clinics-by-organization-id/soft-delete-many-clinics-by-organization-id.command';
import {
  FindClinicAvailabilityByDayResponse
} from '@modules/clinic/application/queries/find-clinic-availability-by-day/find-clinic-availability-by-day.response';
import {
  FindClinicAvailabilityByDayQuery
} from '@modules/clinic/application/queries/find-clinic-availability-by-day/find-clinic-availability-by-day.query';
import {
  FindManyByOrganizationIdQuery
} from '@modules/clinic/application/queries/find-many-by-organization-id/find-many-by-organization-id.query';
import {
  GetClinicScheduleResponse
} from '@modules/clinic/application/queries/get-clinic-schedule/get-clinic-schedule.response';
import {
  GetClinicScheduleQuery
} from '@modules/clinic/application/queries/get-clinic-schedule/get-clinic-schedule.query';
import { Clinic, CreateClinicDto } from '@shared';
import { CreateClinicCommand } from '@modules/clinic/application/commands/create-clinic/create-clinic.command';

@Injectable()
export class ClinicModuleApi implements IClinicModuleApi {
  constructor(
    @Inject(CLINIC_AVAILABILITY_DOMAIN_SERVICE_TOKEN)
    private readonly clinicAvailabilityDomainService: IClinicAvailabilityDomainService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async softDeleteManyWithAnOrganizationId(
    organizationId: string,
    context?: IGetContext
  ): Promise<void> {
    return await this.commandBus.execute(
      new SoftDeleteManyClinicsByOrganizationIdCommand(
        organizationId,
        ExecutionContextFactory.createInternal(context?.source, context)
      )
    );
  }

  findAvailabilityByDay(
    clinicId: string,
    date: Date
  ): Promise<QueryResponse<FindClinicAvailabilityByDayResponse>> {
    return this.queryBus.execute(
      new FindClinicAvailabilityByDayQuery(clinicId, date)
    );
  }

  findManyByOrganizationId(organizationId: string): Promise<Clinic[]> {
    return this.queryBus.execute(
      new FindManyByOrganizationIdQuery(organizationId)
    );
  }

  findSchedule({
    clinicId,
    startDate,
    endDate,
  }: FindScheduleInput): Promise<QueryResponse<GetClinicScheduleResponse>> {
    return this.queryBus.execute(
      new GetClinicScheduleQuery(clinicId, startDate, endDate)
    );
  }

  async assertCanBookOrThrow({
    clinicId,
    startTime,
    endTime,
  }: AssertClinicCanBookInput): Promise<void> {
    const {
      data: availability,
    }: QueryResponse<FindClinicAvailabilityByDayResponse> =
      await this.queryBus.execute(
        new FindClinicAvailabilityByDayQuery(clinicId, startTime)
      );

    const startMinute = DateTimeManager.getDayMinutes(startTime);
    const endMinute = DateTimeManager.getDayMinutes(endTime);

    this.clinicAvailabilityDomainService.validateTimeWithinClinicHoursOrThrow({
      startMinute,
      endMinute,
      clinicSchedule: availability,
    });
  }

  async create(
    dto: CreateClinicDto,
    context: IGetContext
  ): Promise<string | null> {
    const { source } = context;

    const ctx = ExecutionContextFactory.createInternal(source, context);
    return this.commandBus.execute(new CreateClinicCommand(dto, ctx));
  }
}
