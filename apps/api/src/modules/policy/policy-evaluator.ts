import { ForbiddenException } from '@nestjs/common';
import { BasePolicy } from '@modules/policy/base.policy';

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

  orThrow(customMessage?: string): void {
    if (this.isBypassed) return;
    if (!this.isValid) {
      throw new ForbiddenException(
        customMessage || this.lastError || 'Bu işlem için yetkiniz bulunmuyor.'
      );
    }
  }

  allowed(): boolean {
    return this.isValid;
  }
}
