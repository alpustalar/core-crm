import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { UpdateOrganizationDto } from '@shared/modules/organization/dto';
import { UpdateOrganizationInfoCommand } from '@modules/organization/organization/application/commands/update-organization-info/update-organization-info.command';

const { ORGANIZATION } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class OrganizationCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  /** Organizasyon künye bilgilerini günceller. */
  @HasCapability(ORGANIZATION.update)
  @Patch(':organizationId')
  update(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() dto: UpdateOrganizationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateOrganizationInfoCommand({ organizationId, data: dto, ctx })
    );
  }
}
