import { IQuery } from '@nestjs/cqrs';

export interface AssertProviderCanBookQueryPayload {
  providerId: string;
  startTime: Date;
  endTime: Date;
  isConsultation: boolean;
}

export class AssertProviderCanBookQuery implements IQuery {
  readonly __responseType!: void;

  constructor(public readonly payload: AssertProviderCanBookQueryPayload) {}
}
