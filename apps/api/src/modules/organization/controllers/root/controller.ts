import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CAPABILITIES } from '../../../../../prisma/data';
import { AuthGuard } from '@common/guards';
import { CapabilityGuard } from '@common/guards/capability/capability.guard';
import { FindOneUseCase } from '@modules/organization/use-cases/queries/find-one.use-case';
import { UpdateOrganizationUseCase } from '@modules/organization/use-cases/commands';
import { Actor, HasCapability } from '@common/decorators';
import { ActorContext } from '@common/interfaces';
import { plainToInstance } from 'class-transformer';
import { OrganizationResponseDto } from '@modules/organization/dto/organization-response.dto';
import { UpdateOrganizationDto } from '@modules/organization/dto/update-organization.dto';
import { ORGANIZATIONS_PATH } from '@modules/organization/controllers/path';

const { ORGANIZATION } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller(ORGANIZATIONS_PATH)
export class OrganizationController {
  constructor(
    private readonly findOneOrganization: FindOneUseCase,
    private readonly updateOrganization: UpdateOrganizationUseCase,
  ) {}

  @HasCapability(ORGANIZATION.read)
  @Get('detail/:organizationId')
  async findOne(
    @Actor() actor: ActorContext,
    @Param('organizationId', ParseUUIDPipe) organizationId?: string,
  ) {
    const organization = await this.findOneOrganization.execute(
      actor,
      organizationId,
    );

    plainToInstance(OrganizationResponseDto, organization, {
      excludeExtraneousValues: true,
    });
  }

  @HasCapability(ORGANIZATION.update)
  @Patch(':id')
  async update(
    @Actor() actor: ActorContext,
    @Body()
    updateOrganizationDto: UpdateOrganizationDto,
    @Param('organizationId', ParseUUIDPipe) organizationId?: string,
  ) {
    return this.updateOrganization.execute(
      actor,
      updateOrganizationDto,
      organizationId,
    );
  }
}
