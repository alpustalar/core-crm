import { IQuery } from '@nestjs/cqrs';

export class AssertProviderCanBookQuery implements IQuery {
  readonly __responseType!: void;

  constructor(
    public readonly providerId: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly isConsultation: boolean
  ) {}
}
