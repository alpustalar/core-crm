import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindPosDevicesQuery } from './find-pos-devices.query';
import { FindPosDevicesResponse } from './find-pos-devices.response';
import {
  IPosDeviceQueryRepository,
  POS_DEVICE_QUERY_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-device/pos-device.query.repository';

@QueryHandler(FindPosDevicesQuery)
export class FindPosDevicesHandler
  implements IQueryHandler<FindPosDevicesQuery, FindPosDevicesResponse>
{
  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceRepo: IPosDeviceQueryRepository
  ) {}

  async execute(query: FindPosDevicesQuery): Promise<FindPosDevicesResponse> {
    const devices = await this.posDeviceRepo.findByClinicId(query.clinicId);
    return {
      data: devices.map((d) => ({
        id: d.id,
        clinicId: d.clinicId,
        label: d.label,
        provider: d.provider,
        terminalId: d.terminalId,
        merchantId: d.merchantId,
        deviceUniqueId: d.deviceUniqueId,
        isActive: d.isActive,
      })),
    };
  }
}
