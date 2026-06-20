import { PosDevice } from '@prisma/client';
import { CreatePosDeviceData } from '@modules/finance/pos/physical/domain/pos-physical.contracts';

export const POS_DEVICE_COMMAND_REPOSITORY = Symbol(
  'IPosDeviceCommandRepository'
);
export const POS_DEVICE_QUERY_REPOSITORY = Symbol('IPosDeviceQueryRepository');

export interface IPosDeviceCommandRepository {
  create(data: CreatePosDeviceData): Promise<PosDevice>;
  deactivate(id: string): Promise<PosDevice>;
  softDelete(id: string): Promise<void>;
}

export interface IPosDeviceQueryRepository {
  findById(id: string): Promise<PosDevice | null>;
  findByClinicId(clinicId: string): Promise<PosDevice[]>;
}
