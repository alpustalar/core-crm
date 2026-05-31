import { IQuery } from '@nestjs/cqrs';

export class ClinicCanBookOrThrowQuery implements IQuery {
  readonly __responseType!: void;

  constructor(
    public readonly clinicId: string,
    public readonly startTime: Date,
    public readonly endTime: Date
  ) {}
}
