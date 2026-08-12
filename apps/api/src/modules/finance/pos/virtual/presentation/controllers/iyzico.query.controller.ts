import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { HasCapability } from '@common/decorators';
import { GetInstallmentsDto } from '@shared';
import { ROUTE_PATHS } from '@common/constants';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetInstallmentInfoQuery } from '@modules/finance/pos/virtual/application/queries/iyzico/get-installment-info/get-installment-info.query';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { PAYMENT } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(PAYMENT.read)
@Controller(ROUTE_PATHS.PAYMENTS.IYZICO.ROOT)
export class IyzicoQueryController {
  constructor(private readonly queryBus: TSQueryBus) {}
  @Get('installments')
  getInstallmentInfo(@Query() dto: GetInstallmentsDto) {
    return this.queryBus.execute(new GetInstallmentInfoQuery(dto));
  }
}
