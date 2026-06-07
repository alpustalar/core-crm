import { z } from 'zod';
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// APPOINTMENT PROCEDURE SCHEMA
/////////////////////////////////////////

export const AppointmentProcedureSchema = z.object({
  id: z.uuid(),
  appointmentId: z.string(),
  sutCode: z.string(),
  description: z.string().nullable(),
  quantity: z.instanceof(Prisma.Decimal, { message: "Field 'quantity' must be a Decimal. Location: ['Models', 'AppointmentProcedure']"}),
  unitPrice: z.instanceof(Prisma.Decimal, { message: "Field 'unitPrice' must be a Decimal. Location: ['Models', 'AppointmentProcedure']"}).nullable(),
  currency: z.string(),
  createdAt: z.coerce.date(),
})

export type AppointmentProcedure = z.infer<typeof AppointmentProcedureSchema>

export default AppointmentProcedureSchema;
