import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetProviderScheduleQuery } from '@modules/provider/application/queries';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import {
  ConvertUserToProviderCommand,
  SoftDeleteProviderByClinicIdCommand,
} from '@modules/provider/application/commands';
import { ProviderScheduleEntity } from '@modules/provider/domain/entities/provider-schedule.entity';
import { QueryResponse } from '@shared/common/response/response.interface';
import { ProviderScheduleResponse } from '@modules/provider/application/queries/get-provider-schedule/get-provider-schedule.response';
import { ConvertUserToProviderDto } from '@shared';

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
  }: FindScheduleInput): Promise<QueryResponse<ProviderScheduleResponse>> {
    return this.queryBus.execute(
      new GetProviderScheduleQuery(providerId, startDate, endDate)
    );
  }

  async assertCanBookOrThrow({
    providerId,
    startTime,
    endTime,
  }: AssertProviderCanBookInput): Promise<void> {
    const {
      availabilities: providerAvailabilities,
      exceptions: providerExceptions,
    } = await this.queryBus.execute<
      GetProviderScheduleQuery,
      ProviderScheduleResponse
    >(new GetProviderScheduleQuery(providerId, startTime, endTime));

    if (!providerAvailabilities[0].provider.canAcceptExamination) {
      throw new Error('This provider cannot accept examinations');
    }
    const schedule = new ProviderScheduleEntity(
      providerAvailabilities,
      providerExceptions
    );

    schedule.validateBookingAvailabilityOrThrow(startTime, endTime);
  }

  createProvider(dto: ConvertUserToProviderDto): Promise<string> {
    return this.commandBus.execute<ConvertUserToProviderCommand, string>(
      new ConvertUserToProviderCommand(
        ExecutionContextFactory.createInternal(ExecutionSources.INTERNAL_CASCADE),
        dto
      )
    );
  }

  softDeleteByClinicId(clinicId: string) {
    return this.commandBus.execute<SoftDeleteProviderByClinicIdCommand, void>(
      new SoftDeleteProviderByClinicIdCommand(
        clinicId,
        ExecutionContextFactory.createInternal(ExecutionSources.INTERNAL_CASCADE)
      )
    );
  }
}
