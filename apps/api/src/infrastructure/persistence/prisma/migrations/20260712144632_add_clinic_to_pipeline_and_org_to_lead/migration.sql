-- Pipeline artık klinik-seviye (org+klinik birlikte). Org-only eski huniler geçersiz
-- olduğundan (dev'de yeni oluşturuldu, kullanılmıyor) temizlenir; ardından clinic_id NOT NULL eklenir.
DELETE FROM "pipeline_stages";
DELETE FROM "pipelines";
ALTER TABLE "pipelines" ADD COLUMN "clinic_id" TEXT NOT NULL;

-- Lead'e organizationId eklenir; mevcut satırlar sahip kliniğin org'undan backfill edilir,
-- sonra NOT NULL zorlanır. Eşleşmeyen (yetim) satır kalırsa temizlenir.
ALTER TABLE "leads" ADD COLUMN "organization_id" TEXT;
UPDATE "leads" l
SET "organization_id" = c."organization_id"
FROM "clinics" c
WHERE l."clinicId" = c."id";
DELETE FROM "leads" WHERE "organization_id" IS NULL;
ALTER TABLE "leads" ALTER COLUMN "organization_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "leads_organization_id_idx" ON "leads"("organization_id");

-- CreateIndex
CREATE INDEX "pipelines_clinic_id_is_default_idx" ON "pipelines"("clinic_id", "is_default");
