export type SerializationOptionsResponse<T = string> = {
  groups: T[];
  isGroupActive: boolean;
};

export interface SerializationPolicy<TGroup, TPayload = any> {
  getSerializationOptions(
    payload: TPayload
  ): SerializationOptionsResponse<TGroup>;
}
