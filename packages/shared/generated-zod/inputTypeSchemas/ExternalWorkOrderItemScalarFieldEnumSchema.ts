import { z } from 'zod';

export const ExternalWorkOrderItemScalarFieldEnumSchema = z.enum(['id','workOrderId','description','quantity','unitCost','specs']);

export default ExternalWorkOrderItemScalarFieldEnumSchema;
