export class JournalEntryUniqueConstraintException extends Error {
  constructor() {
    super('Bu finansal olay için yevmiye fişi zaten mevcut.');
    this.name = 'JournalEntryUniqueConstraintException';
  }
}
