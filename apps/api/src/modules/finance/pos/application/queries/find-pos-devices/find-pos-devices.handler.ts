import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindPosDevicesQuery } from './find-pos-devices.query';
import { FindPosDevicesResponse } from './find-pos-devices.response';
import {
  IPosDeviceQueryRepository,
  POS_DEVICE_QUERY_REPOSITORY,
} from '@modules/finance/pos/domain/repositories/pos-device.repository';

@QueryHandler(FindPosDevicesQuery)
export class FindPosDevicesHandler
  implements IQueryHandler<FindPosDevicesQuery, FindPosDevicesResponse>
{
  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceQueryRepo: IPosDeviceQueryRepository
  ) {}

  async execute(query: FindPosDevicesQuery): Promise<FindPosDevicesResponse> {
    const devices = await this.posDeviceQueryRepo.findByClinicId(
      query.clinicId
    );
    return {
      data: devices.map((d) => ({
        id: d.id,
        clinicId: d.clinicId,
        label: d.label,
        terminalId: d.terminalId,
        merchantId: d.merchantId,
        isActive: d.isActive,
      })),
    };
  }
}
