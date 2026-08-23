-- Organizasyon sahiplerini, sahibi oldukları organizasyonun kliniklerinin
-- yöneticileri arasına ekler.
--
-- Boşluğun kaynağı: `create-clinic` yeni kliniği kurucunun `managedClinics`
-- listesine bağlamıyordu; yalnız kayıt (registration) akışı ilk kliniği bağlıyordu.
-- Sahiplik organizasyon seviyesinde durduğu için kapsam kontrolü bu kullanıcıları
-- zaten geçiriyordu, ama klinik-seviye listeler ("yönettiğim klinikler", atama
-- ekranları) onları görmüyordu.
--
-- Kod tarafı düzeltildi (AttachClinicToOrganizationOwnersCommand); bu migration
-- geçmiş veriyi hizalar. Eksik bağ yoksa hiçbir satır yazılmaz.
INSERT INTO "_clinic_managers" ("A", "B")
SELECT c."id", owners."B"
FROM "clinics" c
         JOIN "_organization_owners" owners ON owners."A" = c."organization_id"
         JOIN "users" u ON u."id" = owners."B" AND u."deleted_at" IS NULL
WHERE c."deleted_at" IS NULL
  AND NOT EXISTS (SELECT 1
                  FROM "_clinic_managers" existing
                  WHERE existing."A" = c."id"
                    AND existing."B" = owners."B")
ON CONFLICT DO NOTHING;
