export class FinancialEventUniqueConstraintException extends Error {
  constructor() {
    super('FinancialEvent dedupeKey benzersizlik kısıtlaması ihlal edildi.');
    this.name = 'FinancialEventUniqueConstraintException';
  }
}
