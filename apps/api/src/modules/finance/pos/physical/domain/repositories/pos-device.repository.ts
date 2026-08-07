import { PosDevice as IPosDevice } from '@shared';
import { PosDevice } from '@modules/finance/pos/physical/domain/entities/pos-device.entity';

export const POS_DEVICE_COMMAND_REPOSITORY = Symbol(
  'IPosDeviceCommandRepository'
);
export const POS_DEVICE_QUERY_REPOSITORY = Symbol('IPosDeviceQueryRepository');

export interface IPosDeviceCommandRepository {
  create(entity: PosDevice): Promise<PosDevice>;
  deactivate(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  /**
   * Cihazı yükler. Satış/iade/void akışları cihazın var-aktif olduğunu doğrulayıp
   * ona göre işlem yazdığı için bu okuma Command Context'e aittir: replica'dan
   * okumak, devre dışı bırakılmış bir terminalde işlem başlatılmasına yol açabilir.
   */
  findById(id: string): Promise<PosDevice | null>;
}

/**
 * Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor).
 * NOT: `findById` burada yok — tek okuyucusu satış/iade/void akışı olduğu için
 * Command Repo'da yaşıyor (yukarıdaki not).
 */
export interface IPosDeviceQueryRepository {
  findByClinicId(clinicId: string): Promise<IPosDevice[]>;
}
