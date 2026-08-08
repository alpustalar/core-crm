import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { CapabilityGuard } from '@modules/identity/auth/auth/guards/capability/capability.guard';
import { HasCapability } from '@common/decorators';

const { ORGANIZATION } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class OrganizationController {
  constructor() {}

  @HasCapability(ORGANIZATION.read)
  @Get('detail/:organizationId')
  async findOne() {}

  @HasCapability(ORGANIZATION.update)
  @Patch(':id')
  async update() {}
}
