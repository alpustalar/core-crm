import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { RegisterClinicSubMerchantDto } from '@shared';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { RegisterClinicPaymentGatewayCommand } from '@modules/finance/payment-gateway/application/commands/register-clinic-payment-gateway/register-clinic-payment-gateway.command';
import { HasCapability } from '@common/decorators';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { CLINICPAYMENTGATEWAY } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller(':clinicId')
export class ClinicPaymentGatewayCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(CLINICPAYMENTGATEWAY.update)
  @Put('sub-merchant')
  registerSubMerchant(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: RegisterClinicSubMerchantDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RegisterClinicPaymentGatewayCommand(clinicId, dto, ctx)
    );
  }
}
