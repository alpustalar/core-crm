import { HttpStatus } from '@nestjs/common';

/**
 * Bir hatanın HTTP'ye çevrilmiş hâli. Taban filter bunu üretir; alt sınıflar
 * (ör. api'nin Prisma dalı) `mapPlatformException` ile kendi hatalarını aynı
 * şekle çevirir. Böylece yanıt gövdesi tek yerde kurulur.
 */
export interface MappedException {
  status: HttpStatus;
  /** String ya da doğrulama hatalarında dizi olabilir. */
  message: unknown;
  errorCode: string;
  meta?: unknown;
}
