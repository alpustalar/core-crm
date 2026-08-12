import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { ReverseJournalEntryCommand } from '@modules/finance/accounting/posting/application/commands/reverse-journal-entry/reverse-journal-entry.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { JOURNALENTRY } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('journal-entries')
export class JournalCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  /** Storno: POSTED fişi ters kayıtla iptal eder; dönen değer storno fişinin id'si. */
  @HasCapability(JOURNALENTRY.create)
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
}
