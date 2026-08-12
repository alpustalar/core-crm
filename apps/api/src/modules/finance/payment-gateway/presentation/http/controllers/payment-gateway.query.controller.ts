import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetClinicPaymentGatewayQuery } from '@modules/finance/payment-gateway/application/queries/get-clinic-payment-gateway/get-clinic-payment-gateway.query';
import { Serialize } from '@common/decorators/serialize.decorator';
import { ClinicPaymentGatewayResponseDto } from '@modules/finance/payment-gateway/presentation/http/dto/payment-gateway-response.dto';
import type { ClinicPaymentGatewayView } from '@modules/finance/payment-gateway/application/queries/get-clinic-payment-gateway/get-clinic-payment-gateway.response';
import { HasCapability } from '@common/decorators';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { CLINICPAYMENTGATEWAY } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(CLINICPAYMENTGATEWAY.read)
@Controller(':clinicId')
export class ClinicPaymentGatewayQueryController {
  constructor(private readonly queryBus: TSQueryBus) {}
  @Get()
  @Serialize<ClinicPaymentGatewayView, ClinicPaymentGatewayResponseDto>(
    ClinicPaymentGatewayResponseDto
  )
  get(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetClinicPaymentGatewayQuery(clinicId, ctx)
    );
  }
}
