export type DeepNullable<T> = {
  [K in keyof T]: T[K] | null | undefined;
};
