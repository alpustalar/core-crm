/** İyzico başarısız yanıtlarında dönen ama SDK tiplerinde tanımlanmamış alanlar */
export type WithIyzicoError<T> = T & {
  errorMessage?: string;
  errorCode?: string;
};
