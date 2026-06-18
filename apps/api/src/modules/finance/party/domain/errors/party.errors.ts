export class PartyAlreadyExistsError extends Error {
  constructor() {
    super('Bu kaynak için cari zaten mevcut.');
    this.name = 'PartyAlreadyExistsError';
  }
}
