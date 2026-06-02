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
export interface QueryResponse<T> {
  data: T;
  meta?: {
    serializationOptions?: SerializationOptions;
    pagination?: PaginationMeta;
    [key: string]: any;
  };
}
