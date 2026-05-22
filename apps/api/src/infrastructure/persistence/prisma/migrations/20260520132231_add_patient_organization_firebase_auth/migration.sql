-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NOSHOW');

-- CreateEnum
CREATE TYPE "ExternalSystem" AS ENUM ('WHATSAPP', 'N8N', 'GOOGLE_CALENDAR');

-- CreateEnum
CREATE TYPE "ExaminationType" AS ENUM ('FIRST_VISIT', 'FOLLOW_UP', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('SCHEDULED', 'WALK_IN', 'REFERRAL');

-- CreateEnum
CREATE TYPE "ENabizSyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "LedgerStatus" AS ENUM ('COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "LedgerSource" AS ENUM ('PAYMENT_MODULE', 'INVENTORY_MODULE', 'MANUAL_ENTRY');

-- CreateEnum
CREATE TYPE "LedgerCategory" AS ENUM ('TREATMENT_PAYMENT', 'REFUND', 'MATERIAL_PURCHASE', 'STOCK_ADJUSTMENT', 'SALARY', 'RENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'EFT', 'MAIL_ORDER', 'CHEQUE', 'BOND');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "IyzicoTransactionStatus" AS ENUM ('INITIALIZE', 'SUCCESS', 'FAILURE', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ProductUnit" AS ENUM ('PIECE', 'ML', 'GR', 'KG', 'LITER', 'BOX', 'AMPULE', 'VIAL', 'BOTTLE', 'TUBE');

-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'USED');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('PURCHASE', 'SALE');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE', 'USAGE', 'RETURN_TO_SUPPLIER', 'RETURN_FROM_PATIENT', 'WASTE', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT');

-- CreateEnum
CREATE TYPE "StockMovementDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "LanguageDirection" AS ENUM ('LTR', 'RTL');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('XRAY', 'PRESCRIPTION', 'PHOTO', 'CONSENT_FORM', 'LAB_RESULT', 'OTHER');

-- CreateEnum
CREATE TYPE "GlobalStatus" AS ENUM ('ACTIVE', 'DELETED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'DECEASED', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG');

-- CreateEnum
CREATE TYPE "PatientType" AS ENUM ('ACTIVE', 'PASSIVE', 'POTENTIAL');

-- CreateEnum
CREATE TYPE "OperationMode" AS ENUM ('STATIC', 'SHIFT');

-- CreateEnum
CREATE TYPE "ExceptionType" AS ENUM ('OFF', 'ON');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('EQUIPMENT', 'ROOM');

-- CreateEnum
CREATE TYPE "SectorType" AS ENUM ('ALL', 'DENTAL', 'HAIR_TRANSPLANT', 'AESTHETICS');

-- CreateEnum
CREATE TYPE "PlanId" AS ENUM ('FREE_TRIAL', 'BASIC', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PatientPackageStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_phone" TEXT NOT NULL,
    "patient_email" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "treatment_type" TEXT,
    "notes" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "canceled_at" TIMESTAMP(3),
    "canceled_by" TEXT,
    "cancel_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "examination_type" "ExaminationType",
    "visit_type" "VisitType",
    "external_system" "ExternalSystem",
    "external_id" TEXT,
    "treatment_id" TEXT,
    "clinic_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "resource_id" TEXT,
    "is-deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted-at" TIMESTAMP(3),

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sector_id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "district" TEXT,
    "consultationSlotDuration" INTEGER NOT NULL DEFAULT 15,
    "health_facility_code" TEXT,
    "status" "GlobalStatus" NOT NULL DEFAULT 'ACTIVE',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "logo" TEXT,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_availabilities" (
    "id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_minute" INTEGER NOT NULL,
    "end_minute" INTEGER NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "clinic_id" TEXT NOT NULL,

    CONSTRAINT "clinic_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_exceptions" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "clinicId" TEXT NOT NULL,

    CONSTRAINT "clinic_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_diagnoses" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "icd10_code" TEXT NOT NULL,
    "description" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_procedures" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "sut_code" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enabiz_syncs" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "status" "ENabizSyncStatus" NOT NULL DEFAULT 'PENDING',
    "reference_no" TEXT,
    "submitted_at" TIMESTAMP(3),
    "last_attempt_at" TIMESTAMP(3),
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "error_code" TEXT,
    "error_message" TEXT,
    "raw_request" JSONB,
    "raw_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enabiz_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_ledger" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "payment_id" TEXT,
    "installment_id" TEXT,
    "performed_by_id" TEXT,
    "type" "LedgerType" NOT NULL,
    "source" "LedgerSource" NOT NULL,
    "category" "LedgerCategory" NOT NULL,
    "status" "LedgerStatus" NOT NULL DEFAULT 'COMPLETED',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "tax_rate" INTEGER NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "document_no" TEXT,
    "entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "provider_id" TEXT,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_installments" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "installment_no" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "method" "PaymentMethod" NOT NULL DEFAULT 'CREDIT_CARD',
    "due_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "note" TEXT,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iyzico_transactions" (
    "id" TEXT NOT NULL,
    "installment_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "token" TEXT,
    "iyzico_payment_id" TEXT,
    "iyzico_payment_transaction_id" TEXT,
    "raw_response" JSONB,
    "status" "IyzicoTransactionStatus" NOT NULL,
    "error_code" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iyzico_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "tax_number" TEXT,
    "tax_office" TEXT,
    "organization_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stock_code" TEXT NOT NULL,
    "barcode" TEXT,
    "brand" TEXT,
    "description" TEXT,
    "image_url" TEXT,
    "unit" "ProductUnit" NOT NULL,
    "condition" "ProductCondition" NOT NULL DEFAULT 'NEW',
    "vat_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "critical_stock_qty" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "reorder_qty" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "organization_id" TEXT NOT NULL,
    "category_id" TEXT,
    "supplier_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_batches" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "supplier_id" TEXT,
    "lot_number" TEXT,
    "expires_at" TIMESTAMP(3),
    "quantity" DECIMAL(10,3) NOT NULL,
    "purchase_price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_prices" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "clinic_id" TEXT,
    "type" "PriceType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" TIMESTAMP(3),
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "batch_id" TEXT,
    "type" "StockMovementType" NOT NULL,
    "direction" "StockMovementDirection" NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_price" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "vat_rate" DECIMAL(5,2),
    "vat_amount" DECIMAL(10,2),
    "total_amount" DECIMAL(10,2),
    "finance_ledger_id" TEXT,
    "performed_by_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_usages" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "batch_id" TEXT,
    "appointment_id" TEXT,
    "used_by_provider_id" TEXT,
    "quantity" DECIMAL(10,3) NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "stock_movement_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "direction" "LanguageDirection" NOT NULL DEFAULT 'LTR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_files" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "treatmentId" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" "FileType" NOT NULL,

    CONSTRAINT "medical_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "district" TEXT,
    "status" "GlobalStatus" NOT NULL DEFAULT 'ACTIVE',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outbox" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "Outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_groups" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "patient_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "clinic_id" TEXT,
    "sector_id" TEXT,
    "firebase_uid" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "tc_no" TEXT,
    "birth_date" TIMESTAMP(3),
    "gender" "Gender",
    "phone" TEXT NOT NULL,
    "alternative_phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "emergency_contact" TEXT,
    "companion_name" TEXT,
    "companion_phone" TEXT,
    "profile_photo" TEXT,
    "protocol_no" TEXT,
    "allergies" TEXT,
    "chronic_diseases" TEXT,
    "blood_type" "BloodType",
    "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE',
    "patient_type" "PatientType",
    "responsible_provider_id" TEXT,
    "checkup_date" TIMESTAMP(3),
    "discount_rate" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "public_phone" TEXT,
    "public_email" TEXT,
    "diploma_no" TEXT,
    "hlr_no" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "canAcceptExamination" BOOLEAN NOT NULL DEFAULT true,
    "operationMode" "OperationMode" NOT NULL DEFAULT 'STATIC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "clinic_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sectorId" TEXT,
    "providerTitleId" TEXT,
    "providerSpecialtyId" TEXT,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_treatments" (
    "id" TEXT NOT NULL,
    "custom_price" DECIMAL(10,2),
    "custom_duration" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "provider_id" TEXT NOT NULL,
    "treatment_id" TEXT NOT NULL,

    CONSTRAINT "provider_treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_shifts" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_minute" INTEGER NOT NULL,
    "end_minute" INTEGER NOT NULL,
    "break_start_minute" INTEGER,
    "break_end_minute" INTEGER,

    CONSTRAINT "provider_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_availabilities" (
    "id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_minute" INTEGER NOT NULL,
    "end_minute" INTEGER NOT NULL,
    "break_start_minute" INTEGER,
    "break_end_minute" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "provider_id" TEXT NOT NULL,

    CONSTRAINT "provider_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_exceptions" (
    "id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "type" "ExceptionType" NOT NULL DEFAULT 'OFF',
    "reason" TEXT,
    "provider_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_titles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "provider_titles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_title_translations" (
    "id" TEXT NOT NULL,
    "title_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,

    CONSTRAINT "provider_title_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_specialties" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sector_id" TEXT NOT NULL,

    CONSTRAINT "provider_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_specialty_translations" (
    "id" TEXT NOT NULL,
    "specialty_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "provider_specialty_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_availabilities" (
    "id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_minute" INTEGER NOT NULL,
    "end_minute" INTEGER NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "resource_id" TEXT NOT NULL,

    CONSTRAINT "resource_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleCapability" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleCapability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capability" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "Capability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectors" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" "SectorType" NOT NULL,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthly_price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "external_id" TEXT,
    "status" "SubStatus" NOT NULL DEFAULT 'ACTIVE',
    "trial_ends_at" TIMESTAMP(3),
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_items" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "planId" "PlanId",
    "module_id" TEXT,
    "price_at_purchase" DECIMAL(10,2) NOT NULL,
    "external_price_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_categories" (
    "id" TEXT NOT NULL,
    "sector_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "treatment_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentCategoryTranslation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language_id" TEXT NOT NULL,
    "treatment_category_id" TEXT NOT NULL,

    CONSTRAINT "TreatmentCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_treatments" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "treatment_category_id" TEXT NOT NULL,
    "default_duration" INTEGER NOT NULL,
    "sut_code" TEXT,

    CONSTRAINT "master_treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_treatment_translations" (
    "id" TEXT NOT NULL,
    "master_treatment_id" TEXT,
    "language_id" TEXT NOT NULL,
    "treatment_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "aftercare_instructions" TEXT,

    CONSTRAINT "master_treatment_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatments" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "treatment_category_id" TEXT NOT NULL,
    "duration" INTEGER,
    "min_duration" INTEGER,
    "max_duration" INTEGER,
    "sut_code" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "is_package_only" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "clinic_id" TEXT NOT NULL,
    "master_treatment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_packages" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examination_count" INTEGER NOT NULL,
    "control_count" INTEGER NOT NULL,
    "validity_days" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "treatment_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_package_items" (
    "id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "treatment_id" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "treatment_package_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_package_providers" (
    "id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,

    CONSTRAINT "treatment_package_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_treatment_packages" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "PatientPackageStatus" NOT NULL DEFAULT 'ACTIVE',
    "used_examination_count" INTEGER NOT NULL DEFAULT 0,
    "used_control_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_treatment_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "GlobalStatus" NOT NULL DEFAULT 'ACTIVE',
    "roleId" TEXT NOT NULL,
    "clinic_id" TEXT,
    "picture" TEXT,
    "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_clinic_managers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_clinic_managers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_organization_owners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_organization_owners_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PatientToPatientGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PatientToPatientGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointments_external_id_key" ON "appointments"("external_id");

-- CreateIndex
CREATE INDEX "appointments_patient_phone_idx" ON "appointments"("patient_phone");

-- CreateIndex
CREATE INDEX "appointments_start_time_idx" ON "appointments"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_slug_key" ON "clinics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_availabilities_clinic_id_day_of_week_key" ON "clinic_availabilities"("clinic_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_exceptions_clinicId_date_key" ON "clinic_exceptions"("clinicId", "date");

-- CreateIndex
CREATE INDEX "appointment_diagnoses_appointment_id_idx" ON "appointment_diagnoses"("appointment_id");

-- CreateIndex
CREATE INDEX "appointment_procedures_appointment_id_idx" ON "appointment_procedures"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "enabiz_syncs_appointment_id_key" ON "enabiz_syncs"("appointment_id");

-- CreateIndex
CREATE INDEX "enabiz_syncs_status_idx" ON "enabiz_syncs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "finance_ledger_installment_id_key" ON "finance_ledger"("installment_id");

-- CreateIndex
CREATE INDEX "finance_ledger_clinic_id_entry_date_idx" ON "finance_ledger"("clinic_id", "entry_date");

-- CreateIndex
CREATE INDEX "finance_ledger_patient_id_idx" ON "finance_ledger"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_appointment_id_key" ON "payments"("appointment_id");

-- CreateIndex
CREATE INDEX "payment_installments_payment_id_idx" ON "payment_installments"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_installments_payment_id_installment_no_key" ON "payment_installments"("payment_id", "installment_no");

-- CreateIndex
CREATE UNIQUE INDEX "iyzico_transactions_installment_id_key" ON "iyzico_transactions"("installment_id");

-- CreateIndex
CREATE UNIQUE INDEX "iyzico_transactions_conversation_id_key" ON "iyzico_transactions"("conversation_id");

-- CreateIndex
CREATE INDEX "product_categories_organization_id_idx" ON "product_categories"("organization_id");

-- CreateIndex
CREATE INDEX "suppliers_organization_id_idx" ON "suppliers"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_stock_code_key" ON "products"("stock_code");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_organization_id_idx" ON "products"("organization_id");

-- CreateIndex
CREATE INDEX "products_stock_code_idx" ON "products"("stock_code");

-- CreateIndex
CREATE INDEX "product_batches_product_id_clinic_id_idx" ON "product_batches"("product_id", "clinic_id");

-- CreateIndex
CREATE INDEX "product_batches_expires_at_idx" ON "product_batches"("expires_at");

-- CreateIndex
CREATE INDEX "product_prices_product_id_type_valid_to_idx" ON "product_prices"("product_id", "type", "valid_to");

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_finance_ledger_id_key" ON "stock_movements"("finance_ledger_id");

-- CreateIndex
CREATE INDEX "stock_movements_clinic_id_created_at_idx" ON "stock_movements"("clinic_id", "created_at");

-- CreateIndex
CREATE INDEX "stock_movements_product_id_idx" ON "stock_movements"("product_id");

-- CreateIndex
CREATE INDEX "stock_movements_batch_id_idx" ON "stock_movements"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_usages_stock_movement_id_key" ON "product_usages"("stock_movement_id");

-- CreateIndex
CREATE INDEX "product_usages_appointment_id_idx" ON "product_usages"("appointment_id");

-- CreateIndex
CREATE INDEX "product_usages_clinic_id_used_at_idx" ON "product_usages"("clinic_id", "used_at");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE INDEX "medical_files_patient_id_idx" ON "medical_files"("patient_id");

-- CreateIndex
CREATE INDEX "medical_files_provider_id_idx" ON "medical_files"("provider_id");

-- CreateIndex
CREATE INDEX "medical_files_clinic_id_idx" ON "medical_files"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");

-- CreateIndex
CREATE INDEX "patient_groups_clinic_id_idx" ON "patient_groups"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "patients_firebase_uid_key" ON "patients"("firebase_uid");

-- CreateIndex
CREATE INDEX "patients_email_clinic_id_idx" ON "patients"("email", "clinic_id");

-- CreateIndex
CREATE INDEX "patients_first_name_last_name_deleted_at_idx" ON "patients"("first_name", "last_name", "deleted_at");

-- CreateIndex
CREATE INDEX "patients_clinic_id_idx" ON "patients"("clinic_id");

-- CreateIndex
CREATE INDEX "patients_organization_id_idx" ON "patients"("organization_id");

-- CreateIndex
CREATE INDEX "patients_responsible_provider_id_idx" ON "patients"("responsible_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "patients_phone_organization_id_key" ON "patients"("phone", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "providers_user_id_key" ON "providers"("user_id");

-- CreateIndex
CREATE INDEX "providers_clinic_id_idx" ON "providers"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_treatments_provider_id_treatment_id_key" ON "provider_treatments"("provider_id", "treatment_id");

-- CreateIndex
CREATE INDEX "provider_shifts_date_idx" ON "provider_shifts"("date");

-- CreateIndex
CREATE UNIQUE INDEX "provider_shifts_provider_id_date_key" ON "provider_shifts"("provider_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "provider_availabilities_provider_id_day_of_week_key" ON "provider_availabilities"("provider_id", "day_of_week");

-- CreateIndex
CREATE INDEX "provider_exceptions_provider_id_start_time_end_time_idx" ON "provider_exceptions"("provider_id", "start_time", "end_time");

-- CreateIndex
CREATE UNIQUE INDEX "provider_titles_slug_key" ON "provider_titles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "provider_title_translations_title_id_language_id_key" ON "provider_title_translations"("title_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_specialties_slug_key" ON "provider_specialties"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "provider_specialty_translations_specialty_id_language_id_key" ON "provider_specialty_translations"("specialty_id", "language_id");

-- CreateIndex
CREATE INDEX "resources_clinic_id_idx" ON "resources"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "resource_availabilities_resource_id_day_of_week_key" ON "resource_availabilities"("resource_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RoleCapability_roleId_capabilityId_key" ON "RoleCapability"("roleId", "capabilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_module_action_key" ON "Capability"("module", "action");

-- CreateIndex
CREATE UNIQUE INDEX "sectors_slug_key" ON "sectors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "modules_key_key" ON "modules"("key");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_organization_id_key" ON "subscriptions"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_external_id_key" ON "subscriptions"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_items_subscription_id_planId_key" ON "subscription_items"("subscription_id", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_items_subscription_id_module_id_key" ON "subscription_items"("subscription_id", "module_id");

-- CreateIndex
CREATE UNIQUE INDEX "treatment_categories_slug_key" ON "treatment_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "master_treatments_slug_key" ON "master_treatments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "master_treatment_translations_master_treatment_id_language__key" ON "master_treatment_translations"("master_treatment_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_treatment_translations_treatment_id_language_id_key" ON "master_treatment_translations"("treatment_id", "language_id");

-- CreateIndex
CREATE INDEX "treatments_deleted_at_idx" ON "treatments"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "treatments_clinic_id_slug_key" ON "treatments"("clinic_id", "slug");

-- CreateIndex
CREATE INDEX "treatment_packages_clinic_id_idx" ON "treatment_packages"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "treatment_package_items_package_id_treatment_id_key" ON "treatment_package_items"("package_id", "treatment_id");

-- CreateIndex
CREATE UNIQUE INDEX "treatment_package_providers_package_id_provider_id_key" ON "treatment_package_providers"("package_id", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_treatment_packages_payment_id_key" ON "patient_treatment_packages"("payment_id");

-- CreateIndex
CREATE INDEX "patient_treatment_packages_patient_id_idx" ON "patient_treatment_packages"("patient_id");

-- CreateIndex
CREATE INDEX "patient_treatment_packages_package_id_idx" ON "patient_treatment_packages"("package_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "_clinic_managers_B_index" ON "_clinic_managers"("B");

-- CreateIndex
CREATE INDEX "_organization_owners_B_index" ON "_organization_owners"("B");

-- CreateIndex
CREATE INDEX "_PatientToPatientGroup_B_index" ON "_PatientToPatientGroup"("B");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_availabilities" ADD CONSTRAINT "clinic_availabilities_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_exceptions" ADD CONSTRAINT "clinic_exceptions_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_diagnoses" ADD CONSTRAINT "appointment_diagnoses_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_procedures" ADD CONSTRAINT "appointment_procedures_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enabiz_syncs" ADD CONSTRAINT "enabiz_syncs_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_ledger" ADD CONSTRAINT "finance_ledger_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_ledger" ADD CONSTRAINT "finance_ledger_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "payment_installments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_ledger" ADD CONSTRAINT "finance_ledger_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_ledger" ADD CONSTRAINT "finance_ledger_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_installments" ADD CONSTRAINT "payment_installments_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iyzico_transactions" ADD CONSTRAINT "iyzico_transactions_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "payment_installments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "product_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_finance_ledger_id_fkey" FOREIGN KEY ("finance_ledger_id") REFERENCES "finance_ledger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_usages" ADD CONSTRAINT "product_usages_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_usages" ADD CONSTRAINT "product_usages_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_usages" ADD CONSTRAINT "product_usages_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "product_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_usages" ADD CONSTRAINT "product_usages_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_usages" ADD CONSTRAINT "product_usages_used_by_provider_id_fkey" FOREIGN KEY ("used_by_provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_files" ADD CONSTRAINT "medical_files_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_files" ADD CONSTRAINT "medical_files_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_files" ADD CONSTRAINT "medical_files_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_files" ADD CONSTRAINT "medical_files_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_files" ADD CONSTRAINT "medical_files_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_groups" ADD CONSTRAINT "patient_groups_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_responsible_provider_id_fkey" FOREIGN KEY ("responsible_provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_providerTitleId_fkey" FOREIGN KEY ("providerTitleId") REFERENCES "provider_titles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_providerSpecialtyId_fkey" FOREIGN KEY ("providerSpecialtyId") REFERENCES "provider_specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_treatments" ADD CONSTRAINT "provider_treatments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_treatments" ADD CONSTRAINT "provider_treatments_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_shifts" ADD CONSTRAINT "provider_shifts_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_availabilities" ADD CONSTRAINT "provider_availabilities_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_exceptions" ADD CONSTRAINT "provider_exceptions_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_title_translations" ADD CONSTRAINT "provider_title_translations_title_id_fkey" FOREIGN KEY ("title_id") REFERENCES "provider_titles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_title_translations" ADD CONSTRAINT "provider_title_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_specialties" ADD CONSTRAINT "provider_specialties_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_specialty_translations" ADD CONSTRAINT "provider_specialty_translations_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "provider_specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_specialty_translations" ADD CONSTRAINT "provider_specialty_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_availabilities" ADD CONSTRAINT "resource_availabilities_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCapability" ADD CONSTRAINT "RoleCapability_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCapability" ADD CONSTRAINT "RoleCapability_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_items" ADD CONSTRAINT "subscription_items_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_items" ADD CONSTRAINT "subscription_items_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_categories" ADD CONSTRAINT "treatment_categories_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentCategoryTranslation" ADD CONSTRAINT "TreatmentCategoryTranslation_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentCategoryTranslation" ADD CONSTRAINT "TreatmentCategoryTranslation_treatment_category_id_fkey" FOREIGN KEY ("treatment_category_id") REFERENCES "treatment_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_treatments" ADD CONSTRAINT "master_treatments_treatment_category_id_fkey" FOREIGN KEY ("treatment_category_id") REFERENCES "treatment_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_treatment_translations" ADD CONSTRAINT "master_treatment_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_treatment_translations" ADD CONSTRAINT "master_treatment_translations_master_treatment_id_fkey" FOREIGN KEY ("master_treatment_id") REFERENCES "master_treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_treatment_translations" ADD CONSTRAINT "master_treatment_translations_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_master_treatment_id_fkey" FOREIGN KEY ("master_treatment_id") REFERENCES "master_treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_treatment_category_id_fkey" FOREIGN KEY ("treatment_category_id") REFERENCES "treatment_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_packages" ADD CONSTRAINT "treatment_packages_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_package_items" ADD CONSTRAINT "treatment_package_items_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "treatment_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_package_items" ADD CONSTRAINT "treatment_package_items_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_package_providers" ADD CONSTRAINT "treatment_package_providers_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "treatment_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_package_providers" ADD CONSTRAINT "treatment_package_providers_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_treatment_packages" ADD CONSTRAINT "patient_treatment_packages_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_treatment_packages" ADD CONSTRAINT "patient_treatment_packages_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "treatment_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_treatment_packages" ADD CONSTRAINT "patient_treatment_packages_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_treatment_packages" ADD CONSTRAINT "patient_treatment_packages_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_clinic_managers" ADD CONSTRAINT "_clinic_managers_A_fkey" FOREIGN KEY ("A") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_clinic_managers" ADD CONSTRAINT "_clinic_managers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_organization_owners" ADD CONSTRAINT "_organization_owners_A_fkey" FOREIGN KEY ("A") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_organization_owners" ADD CONSTRAINT "_organization_owners_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PatientToPatientGroup" ADD CONSTRAINT "_PatientToPatientGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PatientToPatientGroup" ADD CONSTRAINT "_PatientToPatientGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "patient_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
