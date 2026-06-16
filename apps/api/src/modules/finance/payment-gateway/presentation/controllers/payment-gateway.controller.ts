import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { RegisterClinicSubMerchantDto } from '@shared';
import { GetContext, IGetContext } from '@common/decorators/get-context.decorator';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { RegisterClinicPaymentGatewayCommand } from '@modules/finance/payment-gateway/application/commands/register-clinic-payment-gateway/register-clinic-payment-gateway.command';
import { GetClinicPaymentGatewayQuery } from '@modules/finance/payment-gateway/application/queries/get-clinic-payment-gateway/get-clinic-payment-gateway.query';

/**
 * Kliniğin ödeme altyapısı (Iyzico marketplace alt üye işyeri). Clinic
 * modülünden ayrıştırılmış finance bounded-context endpoint'leri.
 */
@UseGuards(AuthGuard)
@Controller(':clinicId')
export class PaymentGatewayController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

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

  @Get()
  get(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetClinicPaymentGatewayQuery(clinicId, ctx)
    );
  }
}
