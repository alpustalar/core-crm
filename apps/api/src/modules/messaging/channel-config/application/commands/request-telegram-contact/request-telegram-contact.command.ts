/**
 * Bir Telegram sohbetine "telefonunu paylaş" (request_contact) istemi gönderir. Yeni/misafir
 * bir Telegram konuşması oluştuğunda webhook tarafından dispatch edilir; kullanıcı numarasını
 * paylaşınca hasta eşlemesi yapılır. En iyi-çaba (best-effort) — dönüş yok.
 */
export class RequestTelegramContactCommand {
  constructor(
    public readonly clinicId: string,
    public readonly chatId: string
  ) {}
}
