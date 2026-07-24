-- Satış komisyonu (service_fee_percent) klinik config'inden kaldırıldı: komisyon PLATFORM
-- geliridir (klinik değil) ve platform-global env ayarından (HEALTH_TOURISM_SERVICE_FEE_PERCENT)
-- uygulanır; klinik başına ayarlanamaz.
ALTER TABLE "clinic_health_tourism_configs" DROP COLUMN "service_fee_percent";
