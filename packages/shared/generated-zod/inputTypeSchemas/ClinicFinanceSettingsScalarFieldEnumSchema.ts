import { z } from 'zod';

export const ClinicFinanceSettingsScalarFieldEnumSchema = z.enum(['id','clinicId','defaultCurrency','roundingType','invoicePrefix','autoCreateInvoice','autoSendDebtReminder','defaultVatRate','useCostTracking','allowNegativeBalance','maxNegativeBalanceAmount','maxInstallmentCount','isEInvoiceActive','fiscalYearStartMonth','providerPayoutTrigger','updatedAt']);

export default ClinicFinanceSettingsScalarFieldEnumSchema;
