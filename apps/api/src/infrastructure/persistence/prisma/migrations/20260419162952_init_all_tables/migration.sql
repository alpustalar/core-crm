-- CreateEnum
CREATE TYPE "SectorType" AS ENUM ('ALL', 'DENTAL', 'HAIR_TRANSPLANT', 'AESTHETICS');

-- CreateEnum
CREATE TYPE "LanguageDirection" AS ENUM ('LTR', 'RTL');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DELETED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "GlobalStatus" AS ENUM ('ACTIVE', 'DELETED', 'SUSPENDED', 'TRIAL');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NOSHOW');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'DECEASED', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "ExternalSystem" AS ENUM ('WHATSAPP', 'N8N', 'GOOGLE_CALENDAR');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('XRAY', 'PRESCRIPTION', 'PHOTO', 'CONSENT_FORM', 'LAB_RESULT', 'OTHER');

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'ltr',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectors" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" "SectorType" NOT NULL,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
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
    "status" "GlobalStatus" NOT NULL DEFAULT 'ACTIVE',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "logo" TEXT,
    "organization_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "roleId" TEXT,
    "picture" TEXT,
    "clinic_id" TEXT,
    "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "public_phone" TEXT,
    "public_email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
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
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_phone" TEXT NOT NULL,
    "patient_email" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "treatment_type" TEXT,
    "notes" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "canceled_at" TIMESTAMP(3),
    "canceled_by" TEXT,
    "cancel_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "external_system" "ExternalSystem",
    "external_id" TEXT,
    "treatment_id" TEXT,
    "clinic_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "is-deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted-at" TIMESTAMP(3),

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
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
    "language_id" TEXT NOT NULL,
    "treatment_category_id" TEXT NOT NULL,

    CONSTRAINT "TreatmentCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_treatments" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sector_id" TEXT NOT NULL,
    "treatment_category_id" TEXT NOT NULL,
    "default_duration" INTEGER NOT NULL,

    CONSTRAINT "master_treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_treatment_translations" (
    "id" TEXT NOT NULL,
    "master_treatment_id" TEXT,
    "language_id" TEXT NOT NULL,
    "treatment_id" TEXT,
    "treatment_category_id" TEXT NOT NULL,
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
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT,
    "sector_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "tc_no" TEXT,
    "birth_date" TIMESTAMP(3),
    "gender" "Gender" NOT NULL,
    "phone" TEXT NOT NULL,
    "alternative_phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "emergency_contact" TEXT,
    "allergies" TEXT,
    "chronic_diseases" TEXT,
    "blood_type" "BloodType",
    "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "_organization_owners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_organization_owners_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_clinic_managers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_clinic_managers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "sectors_slug_key" ON "sectors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_slug_key" ON "clinics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RoleCapability_roleId_capabilityId_key" ON "RoleCapability"("roleId", "capabilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_module_action_key" ON "Capability"("module", "action");

-- CreateIndex
CREATE UNIQUE INDEX "providers_user_id_key" ON "providers"("user_id");

-- CreateIndex
CREATE INDEX "providers_clinic_id_idx" ON "providers"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_treatments_provider_id_treatment_id_key" ON "provider_treatments"("provider_id", "treatment_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_availabilities_provider_id_day_of_week_key" ON "provider_availabilities"("provider_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "provider_titles_slug_key" ON "provider_titles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "provider_title_translations_title_id_language_id_key" ON "provider_title_translations"("title_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_specialties_slug_key" ON "provider_specialties"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "provider_specialty_translations_specialty_id_language_id_key" ON "provider_specialty_translations"("specialty_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_external_id_key" ON "appointments"("external_id");

-- CreateIndex
CREATE INDEX "appointments_patient_phone_idx" ON "appointments"("patient_phone");

-- CreateIndex
CREATE INDEX "appointments_start_time_idx" ON "appointments"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "treatment_categories_slug_key" ON "treatment_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "master_treatments_slug_key" ON "master_treatments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "master_treatment_translations_master_treatment_id_language__key" ON "master_treatment_translations"("master_treatment_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_treatment_translations_treatment_category_id_languag_key" ON "master_treatment_translations"("treatment_category_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_treatment_translations_treatment_id_language_id_key" ON "master_treatment_translations"("treatment_id", "language_id");

-- CreateIndex
CREATE INDEX "treatments_deleted_at_idx" ON "treatments"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "treatments_clinic_id_slug_key" ON "treatments"("clinic_id", "slug");

-- CreateIndex
CREATE INDEX "patients_phone_clinic_id_idx" ON "patients"("phone", "clinic_id");

-- CreateIndex
CREATE INDEX "patients_email_clinic_id_idx" ON "patients"("email", "clinic_id");

-- CreateIndex
CREATE INDEX "patients_first_name_last_name_deleted_at_idx" ON "patients"("first_name", "last_name", "deleted_at");

-- CreateIndex
CREATE INDEX "patients_clinic_id_idx" ON "patients"("clinic_id");

-- CreateIndex
CREATE INDEX "medical_files_patient_id_idx" ON "medical_files"("patient_id");

-- CreateIndex
CREATE INDEX "medical_files_provider_id_idx" ON "medical_files"("provider_id");

-- CreateIndex
CREATE INDEX "medical_files_clinic_id_idx" ON "medical_files"("clinic_id");

-- CreateIndex
CREATE INDEX "_organization_owners_B_index" ON "_organization_owners"("B");

-- CreateIndex
CREATE INDEX "_clinic_managers_B_index" ON "_clinic_managers"("B");

-- AddForeignKey
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCapability" ADD CONSTRAINT "RoleCapability_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCapability" ADD CONSTRAINT "RoleCapability_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "provider_availabilities" ADD CONSTRAINT "provider_availabilities_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_categories" ADD CONSTRAINT "treatment_categories_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentCategoryTranslation" ADD CONSTRAINT "TreatmentCategoryTranslation_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentCategoryTranslation" ADD CONSTRAINT "TreatmentCategoryTranslation_treatment_category_id_fkey" FOREIGN KEY ("treatment_category_id") REFERENCES "treatment_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_treatments" ADD CONSTRAINT "master_treatments_treatment_category_id_fkey" FOREIGN KEY ("treatment_category_id") REFERENCES "treatment_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_treatments" ADD CONSTRAINT "master_treatments_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_treatment_translations" ADD CONSTRAINT "master_treatment_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_treatment_translations" ADD CONSTRAINT "master_treatment_translations_master_treatment_id_fkey" FOREIGN KEY ("master_treatment_id") REFERENCES "master_treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_treatment_translations" ADD CONSTRAINT "master_treatment_translations_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_treatment_translations" ADD CONSTRAINT "master_treatment_translations_treatment_category_id_fkey" FOREIGN KEY ("treatment_category_id") REFERENCES "treatment_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_master_treatment_id_fkey" FOREIGN KEY ("master_treatment_id") REFERENCES "master_treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_treatment_category_id_fkey" FOREIGN KEY ("treatment_category_id") REFERENCES "treatment_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "_organization_owners" ADD CONSTRAINT "_organization_owners_A_fkey" FOREIGN KEY ("A") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_organization_owners" ADD CONSTRAINT "_organization_owners_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_clinic_managers" ADD CONSTRAINT "_clinic_managers_A_fkey" FOREIGN KEY ("A") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_clinic_managers" ADD CONSTRAINT "_clinic_managers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
