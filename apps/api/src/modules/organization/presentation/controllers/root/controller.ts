import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CAPABILITIES } from '../../../../../infrastructure/persistence/prisma/data';
import { AuthGuard } from '@modules/auth/guards';
import { CapabilityGuard } from '@modules/auth/guards/capability/capability.guard';
import { FindOneUseCase } from '@modules/organization/application/use-cases/queries/find-one.use-case';
import { UpdateOrganizationUseCase } from '@modules/organization/application/use-cases/commands';
import { Actor, HasCapability } from '@common/decorators';
import { ActorContext } from '@common/interfaces';
import { plainToInstance } from 'class-transformer';
import { OrganizationResponseDto } from '@modules/organization/application/dto/organization-response.dto';
import { ORGANIZATIONS_PATH } from '@modules/organization/presentation/controllers/path';
import { UpdateOrganizationDto } from '@shared';

const { ORGANIZATION } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller(ORGANIZATIONS_PATH)
export class OrganizationController {
  constructor(
    private readonly findOneOrganization: FindOneUseCase,
    private readonly updateOrganization: UpdateOrganizationUseCase
  ) {}

  @HasCapability(ORGANIZATION.read)
  @Get('detail/:organizationId')
  async findOne(
    @Actor() actor: ActorContext,
    @Param('organizationId', ParseUUIDPipe) organizationId?: string
  ) {
    const organization = await this.findOneOrganization.execute(
      actor,
      organizationId
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
    @Param('organizationId', ParseUUIDPipe) organizationId?: string
  ) {
    return this.updateOrganization.execute({
      actor,
      dto: updateOrganizationDto,
      organizationId,
    });
  }
}
