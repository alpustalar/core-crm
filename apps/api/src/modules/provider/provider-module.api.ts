import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  GetProviderScheduleQuery,
  ProviderScheduleResult,
} from '@modules/provider/application/queries';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import { SoftDeleteProviderByClinicIdCommand } from '@modules/provider/application/commands';
import { ProviderAvailabilityDomainService } from '@modules/provider/domain/services/provider-availability.domain-service';

interface AssertProviderCanBookInput {
  providerId: string;
  startTime: Date;
  endTime: Date;
}

interface FindScheduleInput {
  providerId: string;
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class ProviderModuleApi {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  findSchedule({
    providerId,
    startDate,
    endDate,
  }: FindScheduleInput): Promise<ProviderScheduleResult> {
    return this.queryBus.execute<
      GetProviderScheduleQuery,
      ProviderScheduleResult
    >(new GetProviderScheduleQuery(providerId, startDate, endDate));
  }

  async assertCanBook({
    providerId,
    startTime,
    endTime,
  }: AssertProviderCanBookInput): Promise<void> {
    const scheduleData = await this.queryBus.execute<
      GetProviderScheduleQuery,
      ProviderScheduleResult
    >(new GetProviderScheduleQuery(providerId, startTime, endTime));

    const schedule = new ProviderAvailabilityDomainService(
      scheduleData.availabilities,
      scheduleData.exceptions
    );

    schedule.validateBookingAvailabilityOrThrow(startTime, endTime);
  }

  async softDeleteByClinicId(clinicId: string, context?: IGetContext) {
    const internalContext = ExecutionContextFactory.createInternal(
      ExecutionSources.INTERNAL_CASCADE,
      context
    );
    return this.commandBus.execute<SoftDeleteProviderByClinicIdCommand, void>(
      new SoftDeleteProviderByClinicIdCommand(clinicId, internalContext)
    );
  }
}
