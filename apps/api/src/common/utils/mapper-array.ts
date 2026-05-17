/**
 * NULL YASAK - BOŞ DİZİ GARANTİLİ
 * Girdi ne olursa olsun çıktı her zaman bir dizidir (TDomain[]).
 */
export function mapperArray<TRaw, TDomain>(
  items: (TRaw | null | undefined)[] | null | undefined,
  mapperFn: (item: TRaw) => TDomain | null | undefined
): TDomain[] {
  // 1. Kural: Eğer liste gelmezse (null/undefined), kesinlikle boş dizi dön.
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return (
    items
      .map((item) => {
        // Eğer eleman null/undefined ise mapper'ı çalıştırma, direkt undefined dön
        if (item === null || item === undefined) return undefined;
        return mapperFn(item);
      })
      // 2. Kural: Mapper'dan dönen null veya undefined sonuçları temizle.
      // Type Guard kullanarak TypeScript'e dizinin temizlendiğini ispatla.
      .filter((res): res is TDomain => res !== null && res !== undefined)
  );
}
