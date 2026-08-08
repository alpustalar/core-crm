export function mapperArray<TRaw, TDomain>(
  items: (TRaw | null | undefined)[] | null | undefined,
  mapperFn: (item: TRaw) => TDomain | null | undefined
): TDomain[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      // Eğer eleman null/undefined ise mapper'ı çalıştırma, direkt undefined dön
      if (item === null || item === undefined) return undefined;
      return mapperFn(item);
    })
    .filter((res): res is TDomain => res !== null && res !== undefined);
}
