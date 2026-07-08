/**
 * Yeni kiracıya otomatik ücretsiz deneme aboneliği başlatır (kayıt sırasında dispatch edilir).
 * Idempotent: kiracının zaten aboneliği varsa no-op.
 */
export class StartTrialCommand {
  readonly __responseType!: void;
  constructor(
    public readonly organizationId: string,
    public readonly clinicId: string | null = null
  ) {}
}
