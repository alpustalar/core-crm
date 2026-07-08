import { QueryResponse } from '@shared/common/response/response.interface';
import { Module } from '@shared';

/** Aktif eklenti modülleri kataloğu (plain generated model listesi). */
export type ListModulesResponse = QueryResponse<Module[]>;
