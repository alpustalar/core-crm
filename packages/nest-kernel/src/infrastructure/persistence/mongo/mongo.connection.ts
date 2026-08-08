/**
 * Messaging'in Mongoose bağlantı adı.
 *
 * Messaging **kendi veritabanına** yazar; varsayılan bağlantı (audit log) ile aynı
 * koleksiyon uzayını paylaşmaz. Ayrı bağlantı olmasının sebebi izolasyon değil sadece
 * temizlik de değil: Faz 3'te messaging ayrı bir sürece çıktığında `MESSAGING_MONGODB_URI`
 * olduğu gibi yeni servise taşınır ve **veri yeniden taşınmaz**. Aynı DB'de kalsaydı
 * ayrılma anında audit ile messaging koleksiyonlarını ayırmak gerekirdi.
 */
export const MESSAGING_MONGO_CONNECTION = 'messaging';
