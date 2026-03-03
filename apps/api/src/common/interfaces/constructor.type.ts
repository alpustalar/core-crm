import { IResponsePolicy } from '@common/interfaces/response-policy.interface';

export type Constructor<T = any> = new (...args: any[]) => T;

export type PolicyConstructor = new (actor: any) => IResponsePolicy;
