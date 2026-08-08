import { Expose, Type } from 'class-transformer';
import { ResponseGroups } from '@common/constants/response-groups.constant';

const { MANAGEMENT, ADMIN } = ResponseGroups;

export class ClinicIyzicoTerminalConfigResponseDto {
  @Expose() id: string;
  @Expose() clinicId: string;

  // --- Fiziksel POS Entegrasyon Sırları (Sadece Yönetim ve Admin) ---
  @Expose({ groups: [MANAGEMENT, ADMIN] })
  clientId: string;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  clientSecret: string;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  username: string;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  password: string;

  // --- Audit Zaman Damgaları ---
  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  createdAt: Date;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  updatedAt: Date;
}
