import { z } from 'zod';
import { AttendanceStatusSchema } from '../inputTypeSchemas/AttendanceStatusSchema'

/////////////////////////////////////////
// ATTENDANCE RECORD SCHEMA
/////////////////////////////////////////

/**
 * Çalışan devam/mesai (puantaj) kaydı — giriş/çıkış saatleri + hesaplanan çalışma/fazla mesai süresi.
 * Çalışan+gün başına tek kayıt (manuel giriş; kart okuyucu/PDKS entegrasyonu ileride aynı
 * check-in/check-out komutlarını farklı bir aktörden tetikleyerek eklenebilir).
 */
export const AttendanceRecordSchema = z.object({
  status: AttendanceStatusSchema,
  id: z.string(),
  employeeId: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  workDate: z.coerce.date(),
  checkInAt: z.coerce.date(),
  checkOutAt: z.coerce.date().nullable(),
  workedMinutes: z.number().int().nullable(),
  overtimeMinutes: z.number().int(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>

export default AttendanceRecordSchema;
