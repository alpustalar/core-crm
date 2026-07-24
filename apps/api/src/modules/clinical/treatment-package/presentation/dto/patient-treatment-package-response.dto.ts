import { Expose, Type } from 'class-transformer';
import { PatientPackageStatus } from '@shared';
import { ResponseGroups } from '@common/constants/response-groups.constant';

const { INTERNAL, MANAGEMENT, DATA_OWNER, FINANCIAL, ADMIN } = ResponseGroups;

export class PatientTreatmentPackageResponseDto {
  @Expose() id: string;
  @Expose() patientId: string;
  @Expose() packageId: string;
  @Expose() providerId: string;
  @Expose() status: PatientPackageStatus;

  // --- Paket Geçerlilik Tarihleri (Herkese Açık) ---
  @Expose()
  @Type(() => Date)
  startDate: Date;

  @Expose()
  @Type(() => Date)
  endDate: Date;

  // --- Kullanım Sayaçları (Hasta Kendisi, Klinik İçi ve Yönetim Görebilir) ---
  @Expose({ groups: [ADMIN, DATA_OWNER, INTERNAL, MANAGEMENT] })
  usedExaminationCount: number;

  @Expose({ groups: [ADMIN, DATA_OWNER, INTERNAL, MANAGEMENT] })
  usedControlCount: number;

  // --- Klinik Notlar (Sadece Klinik İçi Personel, Yönetim ve Veri Sahibi) ---
  @Expose({ groups: [ADMIN, INTERNAL, MANAGEMENT, DATA_OWNER] })
  notes: string | null;

  // --- Finansal Bağlantı ID'si (Sadece Finans ve Yönetim Görebilir, Hasta Göremez) ---
  @Expose({ groups: [ADMIN, FINANCIAL, MANAGEMENT] })
  paymentId: string | null;

  // --- Audit Zaman Damgaları ---
  @Expose({ groups: [ADMIN, MANAGEMENT] })
  @Type(() => Date)
  createdAt: Date;

  @Expose({ groups: [ADMIN, MANAGEMENT] })
  @Type(() => Date)
  updatedAt: Date;
}
