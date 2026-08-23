import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IMessageQueryRepository,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/conversation/domain/repositories/message.repository';
import { GetWhatsappUsageQuery } from './get-whatsapp-usage.query';
import { GetWhatsappUsageResponse } from './get-whatsapp-usage.response';
import { assertActorCanAccessClinic } from '@modules/conversation/domain/guards/clinic-access.guard-fn';

@QueryHandler(GetWhatsappUsageQuery)
export class GetWhatsappUsageHandler implements IQueryHandler<
  GetWhatsappUsageQuery,
  GetWhatsappUsageResponse
> {
  constructor(
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageRepo: IMessageQueryRepository
  ) {}

  async execute(
    query: GetWhatsappUsageQuery
  ): Promise<GetWhatsappUsageResponse> {
    const { payload } = query;

    assertActorCanAccessClinic(payload.ctx.actor, payload.clinicId);

    const byCategory = await this.messageRepo.aggregateUsageByCategory({
      clinicId: payload.clinicId,
      from: payload.from,
      to: payload.to,
    });

    const totalBillable = byCategory.reduce((sum, c) => sum + c.count, 0);

    return {
      data: {
        from: payload.from,
        to: payload.to,
        totalBillable,
        byCategory,
      },
    };
  }
}
