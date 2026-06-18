import { ICommand } from '@nestjs/cqrs';

export class MarkInstallmentAsFailedCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly installmentId: string,
    /** Hata nedeni / audit log detayı; çağıran bağlama göre geçilir. */
    public readonly details?: string
  ) {}
}
