import { PosDevice } from '@modules/finance/pos/physical/domain/entities/pos-device.entity';

export const POS_DEVICE_COMMAND_REPOSITORY = Symbol(
  'IPosDeviceCommandRepository'
);
export const POS_DEVICE_QUERY_REPOSITORY = Symbol('IPosDeviceQueryRepository');

export interface IPosDeviceCommandRepository {
  save(entity: PosDevice): Promise<PosDevice>;
  deactivate(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
}

export interface IPosDeviceQueryRepository {
  findById(id: string): Promise<PosDevice | null>;
  findByClinicId(clinicId: string): Promise<PosDevice[]>;
}
