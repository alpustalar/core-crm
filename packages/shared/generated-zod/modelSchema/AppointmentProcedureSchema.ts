import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// APPOINTMENT PROCEDURE SCHEMA
/////////////////////////////////////////

export const AppointmentProcedureSchema = z.object({
  currency: CurrencySchema,
  id: z.string(),
  appointmentId: z.string(),
  sutCode: z.string(),
  description: z.string().nullable(),
  quantity: decimalSchema("Field 'quantity' must be a Decimal. Location: ['Models', 'AppointmentProcedure']"),
  unitPrice: decimalSchema("Field 'unitPrice' must be a Decimal. Location: ['Models', 'AppointmentProcedure']").nullable(),
  createdAt: z.coerce.date(),
})

export type AppointmentProcedure = z.infer<typeof AppointmentProcedureSchema>

export default AppointmentProcedureSchema;
