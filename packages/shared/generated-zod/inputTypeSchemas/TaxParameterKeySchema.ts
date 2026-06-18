import { z } from 'zod';

export const TaxParameterKeySchema = z.enum(['VAT_HEALTH','VAT_STANDARD','VAT_REDUCED','WHT_SELF_EMPLOYMENT','WHT_RENT','CORP_TAX']);

export type TaxParameterKeyType = `${z.infer<typeof TaxParameterKeySchema>}`

export default TaxParameterKeySchema;
