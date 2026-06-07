import { IQuery } from '@nestjs/cqrs';

export class FindPatientByContactQuery implements IQuery {
  constructor(
    public readonly clinicId: string,
    public readonly phone?: string | null,
    public readonly email?: string | null
  ) {}
}
