import { z } from 'zod';

/////////////////////////////////////////
// CREATE PATIENT TREATMENT PACKAGE SCHEMA
/////////////////////////////////////////

export const CreatePatientTreatmentPackageSchema = z.object({
  id: z.uuid().optional(),
  patientId: z.uuid("Geçerli bir hasta ID'si girilmelidir."),
  packageId: z.uuid("Geçerli bir paket ID'si girilmelidir."),
  providerId: z.uuid("Geçerli bir uzman ID'si girilmelidir."),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  paymentId: z.uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type CreatePatientTreatmentPackageProps = z.infer<
  typeof CreatePatientTreatmentPackageSchema
>;

export const UpdatePatientTreatmentPackageSchema = z
  .object({
    providerId: z
      .uuid({ message: 'Geçerli bir provider ID girmelisiniz.' })
      .optional(),
    startDate: z.coerce
      .date({ message: 'Geçerli bir başlangıç tarihi girmelisiniz.' })
      .optional(),
    endDate: z.coerce
      .date({ message: 'Geçerli bir bitiş tarihi girmelisiniz.' })
      .optional(),
    notes: z
      .string()
      .max(1000, { message: 'Not alanı en fazla 1000 karakter olabilir.' })
      .nullish(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message:
        'Paket bitiş tarihi, başlangıç tarihinden önce veya başlangıç tarihine eşit olamaz.',
      path: ['endDate'],
    }
  );

// TypeScript interface'ini de şemadan türeterek duplikasyonu önleyelim:
export type UpdatePatientTreatmentPackageProps = z.infer<
  typeof UpdatePatientTreatmentPackageSchema
>;
