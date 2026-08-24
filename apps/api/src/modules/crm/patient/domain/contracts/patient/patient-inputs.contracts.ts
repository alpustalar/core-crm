import { BloodTypeType } from '@input-type-schemas/BloodTypeSchema';
import { GenderType } from '@input-type-schemas/GenderSchema';
import { PatientTypeType } from '@input-type-schemas/PatientTypeSchema';

// ==========================================
// HASTA OLUŞTURMA SÖZLEŞMESİ (PROPS)
// ==========================================

export interface CreatePatientProps {
  id?: string;
  firebaseUid?: string;
  organizationId: string;

  // İletişim ve İsim bilgileri (Zorunlu)
  phone?: string | null;
  firstName: string;

  // Opsiyonel alanlar
  clinicId?: string | null;
  sectorId?: string | null;
  lastName?: string | null;
  tcNo?: string | null;
  birthDate?: Date | null;
  gender?: GenderType | null;

  // Ek İletişim
  alternativePhone?: string | null;
  email?: string | null;
  address?: string | null;

  // Acil Durum ve Refakatçi
  emergencyContact?: string | null;
  companionName?: string | null;
  companionPhone?: string | null;

  // Tıbbi ve Operasyonel Bilgiler
  profilePhoto?: string | null;
  protocolNo?: string | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
  bloodType?: BloodTypeType | null;
  patientType?: PatientTypeType | null;

  // Hekim ve Finansal İlişkiler
  responsibleProviderId?: string | null;
  checkupDate?: Date | null;
}
