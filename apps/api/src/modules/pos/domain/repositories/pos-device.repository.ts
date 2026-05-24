import { PosDevice } from '@prisma/client';
import { CreatePosDeviceProps } from '@modules/pos/domain/types/create-pos-device.props';

export const POS_DEVICE_COMMAND_REPOSITORY = Symbol('IPosDeviceCommandRepository');
export const POS_DEVICE_QUERY_REPOSITORY = Symbol('IPosDeviceQueryRepository');

export interface IPosDeviceCommandRepository {
  create(props: CreatePosDeviceProps): Promise<PosDevice>;
  deactivate(id: string): Promise<PosDevice>;
  softDelete(id: string): Promise<void>;
}

export interface IPosDeviceQueryRepository {
  findById(id: string): Promise<PosDevice | null>;
  findByClinicId(clinicId: string): Promise<PosDevice[]>;
}
