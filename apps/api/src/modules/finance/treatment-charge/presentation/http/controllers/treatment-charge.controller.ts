import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { Serialize } from '@common/decorators/serialize.decorator';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  AddTreatmentChargeDto,
  UpdateChargeDiscountDto,
  VoidTreatmentChargeDto,
} from '@shared/modules/treatment-charge/dto/commands';
import { GetAppointmentChargesFilterDto } from '@shared/modules/treatment-charge/dto/queries';
import { AddTreatmentChargeCommand } from '@modules/finance/treatment-charge/application/commands/add-treatment-charge/add-treatment-charge.command';
import { UpdateChargeDiscountCommand } from '@modules/finance/treatment-charge/application/commands/update-charge-discount/update-charge-discount.command';
import { VoidTreatmentChargeCommand } from '@modules/finance/treatment-charge/application/commands/void-treatment-charge/void-treatment-charge.command';
import { GetAppointmentChargesQuery } from '@modules/finance/treatment-charge/application/queries/get-appointment-charges/get-appointment-charges.query';
import { AppointmentChargesResponseDto } from '@modules/finance/treatment-charge/presentation/http/dto/treatment-charge-response.dto';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { TREATMENTCHARGE } = CAPABILITIES;

/**
 * Randevunun fiyatlı işlem satırları. Fatura ve tahsilat tutarları bu satırlardan
 * türediği için ticari gerçeğin giriş kapısı burasıdır.
 */
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('treatment-charges')
export class TreatmentChargeController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @HasCapability(TREATMENTCHARGE.read)
  @Get('appointments/:appointmentId')
  @Serialize<
    { items: unknown[]; summary: unknown },
    AppointmentChargesResponseDto
  >(AppointmentChargesResponseDto)
  findByAppointment(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Query() filter: GetAppointmentChargesFilterDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetAppointmentChargesQuery({ appointmentId, filter, ctx })
    );
  }

  @HasCapability(TREATMENTCHARGE.create)
  @Post('appointments/:appointmentId')
  add(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Body() dto: AddTreatmentChargeDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new AddTreatmentChargeCommand({ appointmentId, data: dto, ctx })
    );
  }

  @HasCapability(TREATMENTCHARGE.update)
  @Patch(':chargeId/discount')
  updateDiscount(
    @Param('chargeId', ParseUUIDPipe) chargeId: string,
    @Body() dto: UpdateChargeDiscountDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateChargeDiscountCommand({ chargeId, data: dto, ctx })
    );
  }

  /** Satır silinmez, iptal edilir — ticari iz korunur. */
  @HasCapability(TREATMENTCHARGE.delete)
  @Delete(':chargeId')
  void(
    @Param('chargeId', ParseUUIDPipe) chargeId: string,
    @Body() dto: VoidTreatmentChargeDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new VoidTreatmentChargeCommand({ chargeId, data: dto, ctx })
    );
  }
}
