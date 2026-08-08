import { defineEndpoint } from '@shared/common/contracts/endpoint';
import type { Lead } from '@shared/generated-zod/modelSchema/LeadSchema';
import {
  ConvertLeadSchema,
  CreateLeadSchema,
  MarkLeadLostSchema,
  MoveLeadToStageSchema,
  UpdateLeadStatusSchema,
} from '../schemas/commands';
import { GetLeadsSchema } from '../schemas/queries';

/**
 * `apps/api` → `LeadController`. Rotalar birebir oradaki dekoratörlerden
 * alınmıştır; kök `@Controller()` boş olduğu için yollar tam yazılıdır
 * (`clinics/:clinicId/leads`, `leads/:leadId/...`).
 *
 * Cevap tipleri handler'ların `*.response.ts` dosyalarından: liste ve detay
 * `Lead` (üretilmiş düz model) döner, command'ler CLAUDE.md kuralı gereği
 * ya oluşan `id`yi ya da hiçbir şeyi döndürür.
 *
 * Sayfalama burada yok — istemcinin birinci sınıf `pagination` seçeneği var,
 * tıpkı controller'ın ayrı `PaginationDto` alması gibi.
 */
export const leadEndpoints = {
  create: defineEndpoint<string>()({
    method: 'POST',
    path: (p: { clinicId: string }) => `/clinics/${p.clinicId}/leads`,
    body: CreateLeadSchema,
  }),

  list: defineEndpoint<Lead[]>()({
    method: 'GET',
    path: (p: { clinicId: string }) => `/clinics/${p.clinicId}/leads`,
    query: GetLeadsSchema,
  }),

  byId: defineEndpoint<Lead>()({
    method: 'GET',
    path: (p: { leadId: string }) => `/leads/${p.leadId}`,
  }),

  updateStatus: defineEndpoint<void>()({
    method: 'PUT',
    path: (p: { leadId: string }) => `/leads/${p.leadId}/status`,
    body: UpdateLeadStatusSchema,
  }),

  convert: defineEndpoint<void>()({
    method: 'PUT',
    path: (p: { leadId: string }) => `/leads/${p.leadId}/convert`,
    body: ConvertLeadSchema,
  }),

  markLost: defineEndpoint<void>()({
    method: 'PUT',
    path: (p: { leadId: string }) => `/leads/${p.leadId}/lost`,
    body: MarkLeadLostSchema,
  }),

  moveToStage: defineEndpoint<void>()({
    method: 'PUT',
    path: (p: { leadId: string }) => `/leads/${p.leadId}/stage`,
    body: MoveLeadToStageSchema,
  }),
} as const;
