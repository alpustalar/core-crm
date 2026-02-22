/*
  Warnings:

  - You are about to drop the `Appointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Clinic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Doctor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorAvailability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DoctorTreatment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MasterTreatment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Patient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Treatment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_clinicId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_treatmentId_fkey";

-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_clinicId_fkey";

-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_userId_fkey";

-- DropForeignKey
ALTER TABLE "DoctorAvailability" DROP CONSTRAINT "DoctorAvailability_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "DoctorTreatment" DROP CONSTRAINT "DoctorTreatment_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "DoctorTreatment" DROP CONSTRAINT "DoctorTreatment_treatmentId_fkey";

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_clinicId_fkey";

-- DropForeignKey
ALTER TABLE "Treatment" DROP CONSTRAINT "Treatment_clinicId_fkey";

-- DropForeignKey
ALTER TABLE "Treatment" DROP CONSTRAINT "Treatment_masterTreatmentId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_clinicId_fkey";

-- DropTable
DROP TABLE "Appointment";

-- DropTable
DROP TABLE "Clinic";

-- DropTable
DROP TABLE "Doctor";

-- DropTable
DROP TABLE "DoctorAvailability";

-- DropTable
DROP TABLE "DoctorTreatment";

-- DropTable
DROP TABLE "MasterTreatment";

-- DropTable
DROP TABLE "Patient";

-- DropTable
DROP TABLE "Treatment";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "district" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "clinic_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "specialty" "DoctorSpecialty" NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_treatments" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "treatment_id" TEXT NOT NULL,
    "custom_price" DECIMAL(10,2),
    "custom_duration" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "doctor_treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_availabilities" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_minute" INTEGER NOT NULL,
    "end_minute" INTEGER NOT NULL,
    "break_start_minute" INTEGER,
    "break_end_minute" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "treatment_id" TEXT NOT NULL,
    "clinic_id" TEXT,
    "doctor_id" TEXT,
    "patient_id" TEXT,
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
    "external_id" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_treatments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TreatmentCategory" NOT NULL,
    "default_duration" INTEGER NOT NULL,

    CONSTRAINT "master_treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatments" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TreatmentCategory" NOT NULL,
    "master_treatment_id" TEXT,
    "duration" INTEGER NOT NULL,
    "min_duration" INTEGER,
    "max_duration" INTEGER,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "is_package_only" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "tcNo" TEXT,
    "birth_date" TIMESTAMP(3),
    "gender" "Gender",
    "phone" TEXT NOT NULL,
    "alternative_phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "emergency_contact" TEXT,
    "allergies" TEXT,
    "chronic_diseases" TEXT,
    "blood_type" "BloodType",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinics_slug_key" ON "clinics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_user_id_key" ON "doctors"("user_id");

-- CreateIndex
CREATE INDEX "doctors_clinic_id_idx" ON "doctors"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_treatments_doctor_id_treatment_id_key" ON "doctor_treatments"("doctor_id", "treatment_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_availabilities_doctor_id_day_of_week_key" ON "doctor_availabilities"("doctor_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_external_id_key" ON "appointments"("external_id");

-- CreateIndex
CREATE INDEX "appointments_patient_phone_idx" ON "appointments"("patient_phone");

-- CreateIndex
CREATE INDEX "appointments_start_time_idx" ON "appointments"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "master_treatments_name_key" ON "master_treatments"("name");

-- CreateIndex
CREATE INDEX "master_treatments_category_idx" ON "master_treatments"("category");

-- CreateIndex
CREATE INDEX "treatments_deleted_at_idx" ON "treatments"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "treatments_clinic_id_name_key" ON "treatments"("clinic_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "patients_tcNo_key" ON "patients"("tcNo");

-- CreateIndex
CREATE UNIQUE INDEX "patients_phone_key" ON "patients"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");

-- CreateIndex
CREATE INDEX "patients_phone_idx" ON "patients"("phone");

-- CreateIndex
CREATE INDEX "patients_first_name_last_name_deleted_at_idx" ON "patients"("first_name", "last_name", "deleted_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_treatments" ADD CONSTRAINT "doctor_treatments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_treatments" ADD CONSTRAINT "doctor_treatments_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_availabilities" ADD CONSTRAINT "doctor_availabilities_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_master_treatment_id_fkey" FOREIGN KEY ("master_treatment_id") REFERENCES "master_treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
