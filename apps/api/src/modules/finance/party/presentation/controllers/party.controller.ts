import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PartyRole } from '@prisma/client';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetPartyByIdQuery } from '@modules/finance/party/application/queries/get-party-by-id/get-party-by-id.query';
import { FindPartiesQuery } from '@modules/finance/party/application/queries/find-parties/find-parties.query';

@UseGuards(AuthGuard)
@Controller()
export class PartyController {
  constructor(private readonly queryBus: TSQueryBus) {}

  @Get()
  findParties(
    @GetContext() ctx: IGetContext,
    @Query() pagination: PaginationDto,
    @Query('role') role?: PartyRole
  ) {
    return this.queryBus.execute(
      new FindPartiesQuery(this.resolveOrganizationId(ctx), pagination, ctx, role)
    );
  }

  @Get(':partyId')
  getParty(
    @GetContext() ctx: IGetContext,
    @Param('partyId', ParseUUIDPipe) partyId: string
  ) {
    return this.queryBus.execute(new GetPartyByIdQuery(partyId, ctx));
  }

  private resolveOrganizationId(ctx: IGetContext): string {
    const organizationId = ctx.actor.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Aktörün organization bağlamı yok.');
    }
    return organizationId;
  }
}
