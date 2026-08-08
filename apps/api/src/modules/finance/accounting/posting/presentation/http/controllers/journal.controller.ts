import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { GetJournalEntriesQuery } from '@modules/finance/accounting/posting/application/queries/get-journal-entries/get-journal-entries.query';
import { ReverseJournalEntryCommand } from '@modules/finance/accounting/posting/application/commands/reverse-journal-entry/reverse-journal-entry.command';
import { JournalEntryStatusType } from '@input-type-schemas/JournalEntryStatusSchema';

@UseGuards(AuthGuard)
@Controller('journal-entries')
export class JournalController {
  constructor(
    private readonly queryBus: TSQueryBus,
    private readonly commandBus: TSCommandBus
  ) {}

  @Get()
  getEntries(
    @GetContext() ctx: IGetContext,
    @Query() pagination: PaginationDto,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
    @Query('status') status?: JournalEntryStatusType,
    @Query('periodId') periodId?: string
  ) {
    return this.queryBus.execute(
      new GetJournalEntriesQuery({
        organizationId,
        pagination,
        ctx,
        status,
        periodId,
      })
    );
  }

  /** Storno: POSTED fişi ters kayıtla iptal eder; dönen değer storno fişinin id'si. */
  @Post(':id/reverse')
  reverse(
    @GetContext() ctx: IGetContext,
    @Param('id') id: string,
    @Body('reason') reason?: string
  ) {
    return this.commandBus.execute(
      new ReverseJournalEntryCommand({ entryId: id, ctx, reason })
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
