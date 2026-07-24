import { IQuery } from '@nestjs/cqrs';

/**
 * Bir klinikte bildirim alacak aktif personel (çalışan + yönetici) userId'lerini
 * döndürür. Cross-module: notification modülü staff bildirimi için bus ile çağırır.
 */
export class FindClinicStaffUserIdsQuery implements IQuery {
  readonly __responseType!: string[];

  constructor(public readonly clinicId: string) {}
}
