import { Routes } from '@nestjs/core';
import { RegistrationModule } from '@modules/registration/registration.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { ClinicModule } from '@modules/clinic/clinic.module';
import { PaymentModule } from '@modules/payment/payment.module';
import { AppointmentModule } from '@modules/appointment/appointment.module';
import { UserModule } from '@modules/user/user.module';
import { ProviderModule } from '@modules/provider/provider.module';
import { FinanceLedgerModule } from '@modules/finance-ledger/finance-ledger.module';
import { PatientModule } from '@modules/patient/patient.module';
import { SubscriptionModule } from '@modules/subscription/subscription.module';
import { PosModule } from '@modules/pos/pos.module';
import { PatientAuthModule } from '@modules/patient-auth/patient-auth.module';
import { MetaAdsModule } from '@modules/meta-ads/meta-ads.module';

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
    path: 'payments',
    module: PaymentModule,
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
    path: 'patient-auth',
    module: PatientAuthModule,
  },
  {
    path: 'meta-ads',
    module: MetaAdsModule,
  },
];
