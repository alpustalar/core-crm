/* eslint-disable */
import { SetMetadata, UseInterceptors } from '@nestjs/common';
import { SerializeInterceptor } from '@common/interceptors/serialize';
import { Constructor, PolicyConstructor } from '@common/interfaces';

export const SERIALIZE_METADATA = 'serialize_metadata';

export interface SerializeOptions {
  dto: Constructor;
  policy: PolicyConstructor;
}

export const Serialize = (dto: any, policy?: any) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    SetMetadata(SERIALIZE_METADATA, { dto, policy })(target, key, descriptor);
    UseInterceptors(SerializeInterceptor)(target, key, descriptor);
  };
};
