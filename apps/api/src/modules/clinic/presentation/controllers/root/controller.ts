import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CreateClinicUseCase,
  UpdateClinicUseCase,
} from '@modules/clinic/application/use-cases';
import { Actor } from '@common/decorators';
import { AuthGuard } from '@modules/auth/guards';
import { ActorContext } from '@common/interfaces';
import { CreateClinicDto, UpdateClinicDto } from '@shared/modules/clinic/index';

@Controller('clinic')
export class ClinicController {
  constructor(
    private readonly createClinic: CreateClinicUseCase,
    private readonly updateClinic: UpdateClinicUseCase
  ) {}

  @Post('')
  @UseGuards(AuthGuard)
  create(@Body() dto: CreateClinicDto, @Actor() actor: ActorContext) {
    return this.createClinic.execute(dto, actor);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClinicDto,
    @Actor() actor: ActorContext
  ) {
    return this.updateClinic.execute(id, dto, actor);
  }
}
