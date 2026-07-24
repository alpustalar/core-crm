import { IQuery } from '@nestjs/cqrs';

export class AssertClinicCanBookQuery implements IQuery {
  readonly __responseType!: void;

  constructor(
    public readonly payload: {
      clinicId: string;
      startTime: Date;
      endTime: Date;
    }
  ) {}
}
