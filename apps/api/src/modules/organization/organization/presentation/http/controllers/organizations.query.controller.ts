import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { Serialize } from '@common/decorators/serialize.decorator';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { Organization } from '@shared';
import { FindByIdQuery } from '@modules/organization/organization/application/queries/find-by-id/find-by-id.query';
import { OrganizationResponseDto } from '@modules/organization/organization/presentation/http/dto/organization-response.dto';

const { ORGANIZATION } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(ORGANIZATION.read)
@Controller()
export class OrganizationQueryController {
  constructor(private readonly queryBus: TSQueryBus) {}

  /** Sahip olunan organizasyonun detayı. */
  @Get('detail/:organizationId')
  @Serialize<Organization, OrganizationResponseDto>(OrganizationResponseDto)
  findOne(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new FindByIdQuery(ctx, organizationId));
  }
}
