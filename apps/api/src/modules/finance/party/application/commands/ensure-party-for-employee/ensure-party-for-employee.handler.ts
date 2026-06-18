import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindOneWithIdOrEmailQuery } from '@modules/identity/user/application/queries/find-one-with-id-or-email/find-one-with-id-or-email.query';
import { EnsurePartyCommand } from '@modules/finance/party/application/commands/ensure-party/ensure-party.command';
import {
  EnsurePartyForEmployeeCommand,
  EnsurePartyForEmployeeResult,
} from './ensure-party-for-employee.command';
import { PartyOriginTypeSchema, PartyRoleSchema, PartyTypeSchema } from '@shared';

@CommandHandler(EnsurePartyForEmployeeCommand)
export class EnsurePartyForEmployeeHandler
  implements
    ICommandHandler<EnsurePartyForEmployeeCommand, EnsurePartyForEmployeeResult>
{
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    command: EnsurePartyForEmployeeCommand
  ): Promise<EnsurePartyForEmployeeResult> {
    const { userId, clinicId, organizationId, ctx } = command;

    const { data: user } = await this.queryBus.execute(
      new FindOneWithIdOrEmailQuery(userId, ctx)
    );
    if (!user) {
      throw new NotFoundException(`Personel bulunamadı: ${userId}`);
    }

    const partyId = await this.commandBus.execute(
      new EnsurePartyCommand(
        {
          clinicId,
          organizationId,
          originType: PartyOriginTypeSchema.enum.USER,
          originId: user.id,
          role: PartyRoleSchema.enum.EMPLOYEE,
          type: PartyTypeSchema.enum.INDIVIDUAL,
          name: user.displayName || 'İsimsiz Personel',
          email: user.email,
          phone: user.phoneNumber,
        },
        ctx
      )
    );

    return { partyId, organizationId };
  }
}
