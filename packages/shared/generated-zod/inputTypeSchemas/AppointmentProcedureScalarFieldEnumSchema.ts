import { z } from 'zod';

export const AppointmentProcedureScalarFieldEnumSchema = z.enum(['id','appointmentId','sutCode','description','quantity','unitPrice','currency','createdAt']);

export default AppointmentProcedureScalarFieldEnumSchema;
