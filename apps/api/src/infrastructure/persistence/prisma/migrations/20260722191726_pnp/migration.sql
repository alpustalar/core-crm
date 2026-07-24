-- CreateTable
CREATE TABLE "consent_form_templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "sector_id" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consent_form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_form_submissions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "template_version" INTEGER NOT NULL,
    "template_title_snapshot" TEXT NOT NULL,
    "template_content_snapshot" TEXT NOT NULL,
    "signature_image" TEXT NOT NULL,
    "signed_at" TIMESTAMP(3) NOT NULL,
    "signed_by_user_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "treatment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consent_form_templates_clinic_id_is_active_idx" ON "consent_form_templates"("clinic_id", "is_active");

-- CreateIndex
CREATE INDEX "consent_form_templates_organization_id_idx" ON "consent_form_templates"("organization_id");

-- CreateIndex
CREATE INDEX "consent_form_submissions_patient_id_idx" ON "consent_form_submissions"("patient_id");

-- CreateIndex
CREATE INDEX "consent_form_submissions_clinic_id_idx" ON "consent_form_submissions"("clinic_id");

-- CreateIndex
CREATE INDEX "consent_form_submissions_template_id_idx" ON "consent_form_submissions"("template_id");

-- AddForeignKey
ALTER TABLE "consent_form_templates" ADD CONSTRAINT "consent_form_templates_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_form_submissions" ADD CONSTRAINT "consent_form_submissions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_form_submissions" ADD CONSTRAINT "consent_form_submissions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "consent_form_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
