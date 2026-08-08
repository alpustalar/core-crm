-- AlterEnum
ALTER TYPE "FinancialEventType" ADD VALUE 'PLATFORM_BOOKING_SETTLED';

-- AlterTable
ALTER TABLE "clinics" ADD COLUMN     "is_platform" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "is_platform" BOOLEAN NOT NULL DEFAULT false;

-- ─────────────────────────────────────────────────────────────────────────────
-- Platform kiracısı (sistem satırı).
--
-- Sağlık turizmi komisyonu klinik değil PLATFORM geliridir, ama defter
-- (FinancialEvent/JournalEntry) clinicId zorunlu ve Clinic'e FK'li. Bu yüzden
-- platform da bir kiracı olarak modellenir ve kendi defterini tutar.
--
-- Seed'de değil migration'da: entrypoint yalnız `migrate deploy` çalıştırıyor,
-- seed dev'e özgü. Bu satırlar olmadan komisyon postlanamaz.
--
-- Üçü de WHERE NOT EXISTS ile korunur → migration yeniden çalışsa da çoğaltmaz.
-- ─────────────────────────────────────────────────────────────────────────────

-- Platform kliniği bir sektöre bağlı olmak zorunda; 'ALL' yoksa açılır.
INSERT INTO "sectors" ("id", "slug", "name")
SELECT '00000000-0000-4000-8000-000000000003', 'all', 'ALL'
WHERE NOT EXISTS (SELECT 1 FROM "sectors" WHERE "slug" = 'all');

INSERT INTO "organizations" (
  "id", "name", "slug", "status", "timezone", "is_platform", "created_at", "updated_at"
)
SELECT
  '00000000-0000-4000-8000-000000000001',
  'Platform', 'platform', 'ACTIVE', 'Europe_Istanbul', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "organizations" WHERE "is_platform" = true);

-- organization_id ve sector_id sabit id ile değil, sorguyla bağlanır: kurulum
-- daha önce başka id'lerle yapılmışsa yanlış satıra bağlanmasın.
INSERT INTO "clinics" (
  "id", "organization_id", "sector_id", "name", "slug",
  "consultationSlotDuration", "status", "timezone", "is_platform",
  "created_at", "updated_at"
)
SELECT
  '00000000-0000-4000-8000-000000000002',
  (SELECT "id" FROM "organizations" WHERE "is_platform" = true LIMIT 1),
  (SELECT "id" FROM "sectors" WHERE "slug" = 'all' LIMIT 1),
  'Platform', 'platform', 15, 'ACTIVE', 'Europe_Istanbul', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "clinics" WHERE "is_platform" = true);
