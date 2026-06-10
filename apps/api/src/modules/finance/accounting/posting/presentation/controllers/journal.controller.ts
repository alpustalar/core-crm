import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JournalEntryStatus } from '@prisma/client';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetJournalEntriesQuery } from '@modules/finance/accounting/posting/application/queries/get-journal-entries/get-journal-entries.query';

@UseGuards(AuthGuard)
@Controller('journal-entries')
export class JournalController {
  constructor(private readonly queryBus: TSQueryBus) {}

  @Get()
  getEntries(
    @GetContext() ctx: IGetContext,
    @Query() pagination: PaginationDto,
    @Query('status') status?: JournalEntryStatus,
    @Query('periodId') periodId?: string
  ) {
    return this.queryBus.execute(
      new GetJournalEntriesQuery(
        this.resolveOrganizationId(ctx),
        pagination,
        ctx,
        status,
        periodId
      )
    );
  }

  private resolveOrganizationId(ctx: IGetContext): string {
    const organizationId = ctx.actor.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Aktörün organization bağlamı yok.');
    }
    return organizationId;
  }
}
