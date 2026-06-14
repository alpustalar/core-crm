import { Routes } from '@nestjs/core';
import { RegistrationModule } from '@modules/identity/auth/registration/registration.module';
import { OrganizationModule } from '@modules/organization/organization/organization.module';
import { ClinicModule } from '@modules/organization/clinic/clinic.module';
import { AppointmentModule } from '@modules/clinical/appointment/appointment.module';
import { UserModule } from '@modules/identity/user/user.module';
import { ProviderModule } from '@modules/clinical/provider/provider.module';
import { FinanceLedgerModule } from '@modules/finance/finance-ledger/finance-ledger.module';
import { PatientModule } from '@modules/crm/patient/patient.module';
import { SubscriptionModule } from '@modules/finance/subscription/subscription.module';
import { PosModule } from '@modules/finance/pos/pos.module';
import { PaymentModule } from '@modules/finance/payment/payment.module';
import { AccountingModule } from '@modules/finance/accounting/accounting.module';
import { PartyModule } from '@modules/finance/party/party.module';
import { PatientAuthModule } from '@modules/identity/auth/patient-auth/patient-auth.module';
import { MetaAdsModule } from '@modules/crm/meta-ads/meta-ads.module';
import { LeadModule } from '@modules/crm/lead/lead.module';
import { AdminRequestModule } from '@modules/platform/admin-request/admin-request.module';
import { HealthTourismModule } from '@modules/crm/health-tourism/health-tourism.module';

export const APP_ROUTES: Routes = [
  {
    path: 'organizations',
    module: OrganizationModule,
  },
  {
    path: 'clinics',
    module: ClinicModule,
  },
  {
    path: 'appointments',
    module: AppointmentModule,
  },
  {
    path: 'users',
    module: UserModule,
  },
  {
    path: 'providers',
    module: ProviderModule,
  },
  {
    path: 'patients',
    module: PatientModule,
  },
  {
    path: 'finance',
    module: FinanceLedgerModule,
  },
  {
    path: 'register',
    module: RegistrationModule,
  },
  {
    path: 'subscription',
    module: SubscriptionModule,
  },
  {
    path: 'pos',
    module: PosModule,
  },
  {
    path: 'payment',
    module: PaymentModule,
  },
  {
    path: 'accounting',
    module: AccountingModule,
  },
  {
    path: 'parties',
    module: PartyModule,
  },
  {
    path: 'patient-auth',
    module: PatientAuthModule,
  },
  {
    path: 'meta-ads',
    module: MetaAdsModule,
  },
  {
    path: 'leads',
    module: LeadModule,
  },
  {
    path: 'admin-requests',
    module: AdminRequestModule,
  },
  {
    path: 'health-tourism',
    module: HealthTourismModule,
  },
];
