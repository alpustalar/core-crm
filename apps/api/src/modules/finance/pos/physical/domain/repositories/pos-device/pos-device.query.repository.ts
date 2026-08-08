import { PosDevice } from '@shared';

export const POS_DEVICE_QUERY_REPOSITORY = Symbol('IPosDeviceQueryRepository');

export interface IPosDeviceQueryRepository {
  findByClinicId(clinicId: string): Promise<PosDevice[]>;
}
