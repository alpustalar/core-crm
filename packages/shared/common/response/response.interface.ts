export interface SerializationOptions {
  isGroupActive: boolean;
  groups: string[];
}
export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Meta = {
  serializationOptions?: SerializationOptions;
  pagination?: PaginationMeta;
  [key: string]: any;
};

export interface QueryResponse<T> {
  data: T;
  meta?: Meta
}
