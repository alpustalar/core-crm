import { ClinicLegalTypeType as ClinicLegalType } from '@input-type-schemas/ClinicLegalTypeSchema';

// ==========================================
// 1. RESMİ SPESİFİKASYON OLUŞTURMA SÖZLEŞMELERİ (PROPS)
// ==========================================

export interface CreateClinicGovernmentSpecsProps {
  id?: string;
  clinicId: string; // Şube ilişkisi için katı UUID kilidi

  // T.C. Sağlık Bakanlığı ÇKYS / Tesis Kodu — HTTP sınırında (UpsertClinicGovernmentSpecsSchema) doğrulanır
  healthFacilityCode: string;

  ussPassword?: string | null; // USS entegrasyon şifresi
  companyTaxNumber?: string | null; // Şirket VKN (Vergi Kimlik Numarası)
  legalType?: ClinicLegalType; // Örn: ŞAHIS, LİMİTED, ANONİM
}

// ==========================================
// 2. RESMİ SPESİFİKASYON GÜNCELLEME SÖZLEŞMELERİ (PROPS)
// ==========================================

export interface UpdateClinicGovernmentSpecsProps {
  // Güncelleme esnasında tüm alanlar opsiyoneldir (Sadece gelen alanlar güncellenir)
  healthFacilityCode?: string;
  ussPassword?: string | null;
  companyTaxNumber?: string | null;
  legalType?: ClinicLegalType;
}
