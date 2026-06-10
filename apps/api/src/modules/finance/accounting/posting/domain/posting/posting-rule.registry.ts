import { Inject, Injectable } from '@nestjs/common';
import { FinancialEventType } from '@prisma/client';
import { POSTING_RULES, PostingRule } from './posting-rule.interface';

@Injectable()
export class PostingRuleRegistry {
  private readonly byType = new Map<FinancialEventType, PostingRule>();

  constructor(@Inject(POSTING_RULES) rules: PostingRule[]) {
    for (const rule of rules) {
      this.byType.set(rule.eventType, rule);
    }
  }

  get(type: FinancialEventType): PostingRule | undefined {
    return this.byType.get(type);
  }

  has(type: FinancialEventType): boolean {
    return this.byType.has(type);
  }
}
