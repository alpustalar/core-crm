import { z } from 'zod';
import {
  CreateCashRegisterSchema,
  OpenCashSessionSchema,
  CloseCashSessionSchema,
  RecordCashMovementSchema,
} from '../../schemas/commands';

export type CreateCashRegister = z.infer<typeof CreateCashRegisterSchema>;
export type OpenCashSession = z.infer<typeof OpenCashSessionSchema>;
export type CloseCashSession = z.infer<typeof CloseCashSessionSchema>;
export type RecordCashMovement = z.infer<typeof RecordCashMovementSchema>;
