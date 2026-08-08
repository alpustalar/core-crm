import type { ZodType, input as ZodInput } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/**
 * Bir endpoint'in sözleşmesi: hangi metod, hangi yol, hangi gövde/sorgu şeması
 * ve hangi cevap tipi. `apps/api` controller'ındaki rotanın birebir aynasıdır.
 *
 * **Yazma disiplini:** yeni endpoint açan backend geliştiricisi aynı PR'da
 * buradaki kaydı da ekler (bkz. frontend-architecture.md §4).
 */
export interface EndpointDefinition<
  TResponse,
  TParams,
  TBody extends ZodType | undefined,
  TQuery extends ZodType | undefined,
> {
  method: HttpMethod;
  /**
   * Parametresiz endpoint'lerde düz `string`, parametrelide kurucu fonksiyon.
   * Bu ayrım koşullu tiple yapılıyor çünkü alan her zaman birleşim olarak
   * dursaydı `ParamsOf` sabit yollu endpoint'lerde de varsayılan `void`u
   * çıkarır ve `params`ı gereksiz yere **zorunlu** kılardı.
   */
  path: [TParams] extends [void] ? string : (params: TParams) => string;
  body?: TBody;
  query?: TQuery;
  /**
   * **Hayalet alan** — yalnız tip taşır, çalışma zamanında yoktur
   * (`defineEndpoint` nesneyi bu alan olmadan döndürüp cast eder).
   *
   * Cevabı runtime'da doğrulamıyoruz: doğrulayabileceğimiz tek şema ailesi
   * `generated-zod` ve o 1.3 MB'lık paketi tarayıcıya sokmak Faz 0'da bilinçle
   * engellendi. Cevap tipi bu yüzden sözleşmeden gelen bir **vaat**, kanıt değil.
   */
  readonly __response: TResponse;
}

export type AnyEndpoint = {
  method: HttpMethod;
  path: string | ((params: never) => string);
  body?: ZodType;
  query?: ZodType;
  readonly __response: unknown;
};

/**
 * Cevap tipi çıkarımla değil, açık tip argümanıyla verilir:
 *
 * ```ts
 * export const leadEndpoints = {
 *   create: defineEndpoint<string>()({
 *     method: 'POST',
 *     path: (p: { clinicId: string }) => `/clinics/${p.clinicId}/leads`,
 *     body: CreateLeadSchema,
 *   }),
 *   list: defineEndpoint<Lead[]>()({
 *     method: 'GET',
 *     path: (p: { clinicId: string }) => `/clinics/${p.clinicId}/leads`,
 *     query: GetLeadsSchema,
 *   }),
 * };
 * ```
 *
 * İki aşamalı çağrı (`<T>()(...)`) TypeScript'in kısmi tip argümanını
 * desteklememesinden: cevap tipini elle verirken gövde/sorgu/parametre
 * tiplerinin çıkarımını kaybetmemenin tek yolu bu.
 */
export function defineEndpoint<TResponse>() {
  return function <
    TParams = void,
    TBody extends ZodType | undefined = undefined,
    TQuery extends ZodType | undefined = undefined,
  >(definition: {
    method: HttpMethod;
    path: string | ((params: TParams) => string);
    body?: TBody;
    query?: TQuery;
  }): EndpointDefinition<TResponse, TParams, TBody, TQuery> {
    return definition as EndpointDefinition<TResponse, TParams, TBody, TQuery>;
  };
}

/*
 * Aşağıdaki çıkarımlar jenerik slotlar üzerinden değil, **yapısal** olarak
 * yazıldı. `EndpointDefinition<infer R, never, never, never>` biçimi çalışmaz:
 * eşleşme için `body?: SomeSchema` tipinin `body?: never`e atanabilir olması
 * gerekirdi, ki değil. Property üzerinden `infer` bu tuzağa düşmez.
 */

export type ResponseOf<E> = E extends { __response: infer R } ? R : never;

/**
 * Yol sabit bir string ise `never` döner — o zaman `params` geçilemez.
 *
 * İki adımlı yazılmasının sebebi `path`in bir **birleşim** olması
 * (`string | ((p: T) => string)`). Tek adımda
 * `E extends { path: (p: infer P) => string }` yazılırsa eşleşme hiç tutmaz,
 * çünkü birleşimin tamamı fonksiyon değil — sonuç sessizce `never` olur ve
 * zorunlu parametreler derleyiciden kaçar. Önce `path`i çıkarıp sonra birleşim
 * üzerinde dağıtımlı koşul çalıştırmak doğru dalı seçer.
 */
export type ParamsOf<E> = E extends { path: infer TPath }
  ? TPath extends (params: infer P) => string
    ? P
    : never
  : never;

/**
 * Gövde/sorgu için `z.input` kullanılır, `z.infer` (= output) değil. Fark
 * `PaginationSchema` gibi `.transform()` taşıyan şemalarda kritik: çıktı
 * sunucunun türettiği `take`/`skip` alanlarını da içerir, oysa istemci onları
 * göndermez — gönderirse türetilmiş alanı uydurmuş olur.
 */
export type BodyOf<E> = E extends { body?: infer B }
  ? B extends ZodType
    ? ZodInput<B>
    : never
  : never;

export type QueryOf<E> = E extends { query?: infer Q }
  ? Q extends ZodType
    ? ZodInput<Q>
    : never
  : never;
