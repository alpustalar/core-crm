export * from './auth';
export * from './system-admin';

// Yetki (capability) guard'ı çekirdekte yaşar: okuduğu `@HasCapability` metadata'sı
// da orada tanımlı ve guard'ın hiçbir api-özel bağımlılığı yok. Buradan yeniden
// ihraç ediliyor ki controller'ların import yolu tek yerde kalsın.
export { CapabilityGuard } from '@src/auth/capability.guard';
