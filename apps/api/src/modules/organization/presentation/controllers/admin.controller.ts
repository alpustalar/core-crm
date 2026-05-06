import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Actor } from '@common/decorators';
import { AuthGuard } from '@modules/auth/guards';
import {
  CreateOrganizationUseCase,
  SoftDeleteOrganizationUseCase,
} from '@modules/organization/application/use-cases/commands';
import { ActorContext } from '@common/interfaces';
import { SystemAdminGuard } from '@modules/auth/guards/system-admin/system-admin.guard';
import { CreateOrganizationDto } from '@shared';
import { OrganizationPaths } from '@modules/organization/presentation/controllers/path';

@UseGuards(AuthGuard, SystemAdminGuard)
@Controller(OrganizationPaths.ADMIN)
export class AdminController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly softDeleteOrganizationUseCase: SoftDeleteOrganizationUseCase
  ) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.createOrganizationUseCase.execute(createOrganizationDto);
  }

  @Delete(':organization-id')
  softDelete(
    @Param('organization-id') organizationId: string,
    @Actor() actor: ActorContext
  ) {
    return this.softDeleteOrganizationUseCase.execute(organizationId, actor);
  }
}
