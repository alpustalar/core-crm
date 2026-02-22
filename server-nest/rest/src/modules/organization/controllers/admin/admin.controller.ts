import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Actor } from '@common/decorators';
import { AuthGuard } from '@common/guards';
import {
  CreateOrganizationUseCase,
  SoftDeleteOrganizationUseCase,
} from '@modules/organization/use-cases/commands';
import { CreateOrganizationDto } from '@modules/organization/dto/create-organization.dto';
import { ActorContext } from '@common/interfaces';
import { SystemAdminGuard } from '@common/guards/system-admin/system-admin.guard';

@UseGuards(AuthGuard, SystemAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly softDeleteOrganizationUseCase: SoftDeleteOrganizationUseCase,
  ) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.createOrganizationUseCase.execute(createOrganizationDto);
  }

  @Delete(':organization-id')
  softDelete(
    @Param('organization-id') organizationId: string,
    @Actor() actor: ActorContext,
  ) {
    return this.softDeleteOrganizationUseCase.execute(organizationId, actor);
  }
}
