import { defineEndpoint } from '@shared/common/contracts/endpoint';
import type { Patient } from '@shared/generated-zod/modelSchema/PatientSchema';
import { GetPatientsSchema } from '../schemas/queries';

/**
 * `apps/api` → `PatientQueryController` (`patients` rotası altında).
 *
 * Yazma uçları burada **yok**: hasta kaydı bugün yalnız lead dönüşümünden ve
 * hasta portalı akışlarından doğuyor (`CreatePatientCommand` cross-module
 * çağrılıyor), personel için bir "hasta oluştur" HTTP ucu tanımlı değil.
 * Açıldığında buraya eklenir.
 */
export const patientEndpoints = {
  list: defineEndpoint<Patient[]>()({
    method: 'GET',
    path: '/patients',
    query: GetPatientsSchema,
  }),

  byId: defineEndpoint<Patient>()({
    method: 'GET',
    path: (p: { patientId: string }) => `/patients/${p.patientId}`,
  }),
} as const;
