import { Routes } from '@nestjs/core';
import { RegistrationModule } from '@modules/identity/auth/registration/registration.module';
import { OrganizationModule } from '@modules/organization/organization/organization.module';
import { ClinicModule } from '@modules/organization/clinic/clinic.module';
import { AppointmentModule } from '@modules/clinical/appointment/appointment.module';
import { UserModule } from '@modules/identity/user/user.module';
import { ProviderModule } from '@modules/clinical/provider/provider.module';
import { FinanceLedgerModule } from '@modules/finance/finance-ledger/finance-ledger.module';
import { PatientModule } from '@modules/crm/patient/patient.module';
import { SubscriptionModule } from '@modules/platform/subscription/subscription.module';
import { PosModule } from '@modules/finance/pos/pos.module';
import { PaymentModule } from '@modules/finance/payment/payment.module';
import { AccountingModule } from '@modules/finance/accounting/accounting.module';
import { PartyModule } from '@modules/finance/party/party.module';
import { PaymentGatewayModule } from '@modules/finance/payment-gateway/payment-gateway.module';
import { PurchaseInvoiceModule } from '@modules/finance/purchase-invoice/purchase-invoice.module';
import { InvoiceModule } from '@modules/finance/invoice/invoice.module';
import { PayrollModule } from '@modules/finance/payroll/payroll.module';
import { PatientAuthModule } from '@modules/identity/auth/patient-auth/patient-auth.module';
import { MetaAdsModule } from '@modules/crm/meta-ads/meta-ads.module';
import { LeadModule } from '@modules/crm/lead/lead.module';
import { PipelineModule } from '@modules/crm/pipeline/pipeline.module';
import { ActivityModule } from '@modules/crm/activity/activity.module';
import { AdminRequestModule } from '@modules/platform/admin-request/admin-request.module';
import { HealthTourismModule } from '@modules/crm/health-tourism/health-tourism.module';
import { GovernanceModule } from '@modules/organization/clinic-governance/governance.module';
import { MessagingModule } from '@modules/messaging/messaging.module';
import { InventoryModule } from '@modules/supply/inventory/inventory.module';
import { NotificationModule } from '@modules/platform/notification/notification.module';
import { EmployeeModule } from '@modules/hr/employee/employee.module';
import { PurchasingModule } from '@modules/supply/purchasing/purchasing.module';
import { CashRegisterModule } from '@modules/finance/cash-register/cash-register.module';
import { BankModule } from '@modules/finance/bank/bank.module';
import { WorkOrderModule } from '@modules/supply/work-order/work-order.module';

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
    path: 'payment-gateways',
    module: PaymentGatewayModule,
  },
  {
    path: 'purchase-invoices',
    module: PurchaseInvoiceModule,
  },
  {
    path: 'invoices',
    module: InvoiceModule,
  },
  {
    path: 'payroll',
    module: PayrollModule,
  },
  {
    path: 'governance',
    module: GovernanceModule,
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
    path: 'pipelines',
    module: PipelineModule,
  },
  {
    path: 'activities',
    module: ActivityModule,
  },
  {
    path: 'admin-requests',
    module: AdminRequestModule,
  },
  {
    path: 'health-tourism',
    module: HealthTourismModule,
  },
  {
    path: 'messaging',
    module: MessagingModule,
  },
  {
    path: 'inventory',
    module: InventoryModule,
  },
  {
    path: 'notifications',
    module: NotificationModule,
  },
  {
    path: 'employees',
    module: EmployeeModule,
  },
  {
    path: 'purchasing',
    module: PurchasingModule,
  },
  {
    path: 'cash',
    module: CashRegisterModule,
  },
  {
    path: 'bank',
    module: BankModule,
  },
  {
    path: 'work-orders',
    module: WorkOrderModule,
  },
];
