import { z } from 'zod';

export const ClinicFinanceSettingsScalarFieldEnumSchema = z.enum(['id','defaultCurrency','autoCreateInvoice','defaultVatRate','useCostTracking','allowNegativeBalance','maxInstallmentCount','fiscalYearStartMonth','clinicId','updatedAt']);

export default ClinicFinanceSettingsScalarFieldEnumSchema;
