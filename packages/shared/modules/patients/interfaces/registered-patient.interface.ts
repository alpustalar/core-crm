import type { Patient } from '@shared/generated-zod/modelSchema/PatientSchema';

/**
 * Telefon ve Firebase kimliği garanti edilmiş hasta kaydı.
 *
 * Plain Patient shape üzerinde çalışır (domain entity değil); böylece backend
 * modülleri (identity, clinical, crm) ve frontend aynı sözleşmeyi paylaşır.
 */
export type RegisteredPatient = Patient & {
  phone: string;
  firebaseUid: string;
};

/**
 * Bir hasta kaydının "kayıtlı" (telefon + Firebase hesabı bağlı) olup
 * olmadığını daraltan modül-bağımsız type guard.
 *
 * Hata fırlatmaz; çağıran taraf kendi bağlamına uygun istisnayı seçer
 * (örn. identity → UnauthorizedException, crm → DomainException).
 */
export function isRegisteredPatient(
  patient: Patient
): patient is RegisteredPatient {
  return Boolean(patient.phone) && Boolean(patient.firebaseUid);
}
