import { ForbiddenException } from '@nestjs/common';
import { BasePolicy } from '@modules/policy/application/base.policy';

export class PolicyEvaluator<T extends BasePolicy> {
  private isValid: boolean = true;
  private lastError?: string;
  private readonly isBypassed: boolean;

  constructor(private readonly policy: T) {
    if (this.policy.isSystemAdmin()) {
      this.isBypassed = true;
    }
  }

  check(predicate: (policy: T) => boolean, errorMessage?: string): this {
    if (this.isBypassed) return this;
    if (!this.isValid) return this;

    const result = predicate(this.policy);
    if (!result) {
      this.isValid = false;
      this.lastError = errorMessage;
    }
    return this;
  }

  orThrow(callback?: (error: string) => void, customMessage?: string): void {
    if (this.isBypassed) return;

    if (!this.isValid) {
      const finalMessage =
        customMessage || this.lastError || 'Bu işlem için yetkiniz bulunmuyor.';

      // Hata fırlatılmadan hemen önce callback çalıştırılır
      if (callback) {
        callback(finalMessage);
      }

      throw new ForbiddenException(finalMessage);
    }
  }

  async orAsyncThrow(
    callback?: (error: string) => Promise<void>,
    customMessage?: string
  ): Promise<void> {
    if (this.isBypassed) return;

    if (!this.isValid) {
      const finalMessage =
        customMessage || this.lastError || 'Bu işlem için yetkiniz bulunmuyor.';

      if (callback) {
        await callback(finalMessage);
      }

      throw new ForbiddenException(finalMessage);
    }
  }

  allowed(): boolean {
    return this.isValid;
  }
}
