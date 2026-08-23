import { ICommand } from '@nestjs/cqrs';

/**
 * Yeni açılan kliniği, organizasyonun sahiplerinin yönettiği klinikler arasına ekler.
 *
 * Klinik modülü kullanıcı tablosuna yazamaz (bounded context); bağ bu komutla,
 * sahibi olan identity modülünde kurulur. Yetkilendirme çağıran tarafta yapılır:
 * komut yalnız yetkisi doğrulanmış bir klinik oluşturmanın ardından gönderilir ve
 * hiçbir controller'dan erişilemez.
 */
export class AttachClinicToOrganizationOwnersCommand implements ICommand {
  readonly __responseType!: void;

  constructor(
    public readonly organizationId: string,
    public readonly clinicId: string
  ) {}
}
