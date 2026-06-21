import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';
import {
  PAX_ACK,
  PAX_APPROVED_RESULT_CODE,
  PAX_COMMANDS,
  PAX_DEFAULT_TIMEOUT_MS,
  PAX_ETX,
  PAX_NAK,
  PAX_PROTOCOL_VERSION,
  PAX_STX,
  PAX_TRANS_TYPE,
} from './pax.constants';
import {
  PaxConnectionError,
  PaxProtocolError,
  PaxTimeoutError,
} from './pax.errors';
import {
  buildPacket,
  fieldsToRecord,
  formatAmount,
  parsePacket,
} from './protocol/pax.protocol';
import {
  PaxBatchCloseInput,
  PaxBatchCloseResult,
  PaxDeviceConfig,
  PaxRefundInput,
  PaxResult,
  PaxSaleInput,
  PaxVoidInput,
} from '@src/infrastructure/payment/pos/physical/providers/pax/pax.contracts';

/**
 * PAX POSLINK v1.28 — TCP socket tabanlı POS terminal servisi.
 *
 * Her işlem yeni bir TCP bağlantısı açar; cihaz config'i (host, port) çağıran handler
 * tarafından Prisma'dan çekilerek geçirilir (multi-tenant).
 *
 * Timeout/bağlantı kopması → PaxTimeoutError / PaxConnectionError fırlatır.
 * Handler bu hataları yakalayarak işlemi PENDING bırakmalı; reconcile job devreye girer.
 */
@Injectable()
export class PaxService {
  private readonly logger = new Logger(PaxService.name);

  async sale(input: PaxSaleInput): Promise<PaxResult> {
    const { device, amountInMinorUnits, ecReferenceNumber, timeout } = input;

    const packet = buildPacket(PAX_COMMANDS.DO_CREDIT, [
      PAX_PROTOCOL_VERSION,
      PAX_TRANS_TYPE.SALE,
      // AmountGroup (US ile ayrılır): [TransactionAmount, TipAmount, CashBackAmount]
      [formatAmount(amountInMinorUnits), '', ''],
      // TraceGroup (US ile ayrılır): [ReferenceNumber, InvoiceNumber]
      [ecReferenceNumber],
      '', // extData
    ]);

    this.logger.log(
      `PAX sale — ecRef=${ecReferenceNumber} amount=${amountInMinorUnits} host=${device.host}`
    );
    const response = await this.sendPacket(
      device,
      packet,
      timeout ?? PAX_DEFAULT_TIMEOUT_MS
    );
    return this.parseTransactionResponse(response);
  }

  async refund(input: PaxRefundInput): Promise<PaxResult> {
    const {
      device,
      amountInMinorUnits,
      ecReferenceNumber,
      originalReferenceNumber,
      timeout,
    } = input;

    const packet = buildPacket(PAX_COMMANDS.DO_CREDIT, [
      PAX_PROTOCOL_VERSION,
      PAX_TRANS_TYPE.REFUND,
      // AmountGroup: [TransactionAmount, TipAmount, CashBackAmount]
      [formatAmount(amountInMinorUnits), '', ''],
      // TraceGroup: [ReferenceNumber, InvoiceNumber]
      [ecReferenceNumber],
      originalReferenceNumber ? `OrigRefNum=${originalReferenceNumber}` : '',
    ]);

    this.logger.log(
      `PAX refund — ecRef=${ecReferenceNumber} amount=${amountInMinorUnits} host=${device.host}`
    );
    const response = await this.sendPacket(
      device,
      packet,
      timeout ?? PAX_DEFAULT_TIMEOUT_MS
    );
    return this.parseTransactionResponse(response);
  }

  async void(input: PaxVoidInput): Promise<PaxResult> {
    const {
      device,
      amountInMinorUnits,
      ecReferenceNumber,
      originalReferenceNumber,
      timeout,
    } = input;

    const packet = buildPacket(PAX_COMMANDS.DO_CREDIT, [
      PAX_PROTOCOL_VERSION,
      PAX_TRANS_TYPE.VOID,
      // AmountGroup: [TransactionAmount, TipAmount, CashBackAmount]
      // Bazı TR banka firmware'leri void'de orijinal tutarı zorunlu tutar.
      [formatAmount(amountInMinorUnits), '', ''],
      // TraceGroup: [ReferenceNumber, InvoiceNumber]
      [ecReferenceNumber],
      `OrigRefNum=${originalReferenceNumber}`,
    ]);

    this.logger.log(
      `PAX void — ecRef=${ecReferenceNumber} amount=${amountInMinorUnits} origRef=${originalReferenceNumber} host=${device.host}`
    );
    const response = await this.sendPacket(
      device,
      packet,
      timeout ?? PAX_DEFAULT_TIMEOUT_MS
    );
    return this.parseTransactionResponse(response);
  }

  /**
   * Bekleyen bir işlemin terminal tarafındaki durumunu sorgular.
   *
   * PAX POSLINK'de evrensel bir "ref ile sorgula" komutu yoktur; T05 bazı
   * firmware sürümlerinde son onaylı işlemi döner. Desteklenmiyorsa null döner.
   */

  // TODO: Gerçek terminal testinden sonra komut kodu doğrulanmalı
  async queryTransactionStatus(input: {
    device: PaxDeviceConfig;
    ecReferenceNumber: string;
    timeout?: number;
  }): Promise<PaxResult | null> {
    const { device, ecReferenceNumber, timeout } = input;

    const packet = buildPacket('T05', [
      PAX_PROTOCOL_VERSION,
      ecReferenceNumber,
      '',
    ]);

    try {
      const response = await this.sendPacket(device, packet, timeout ?? 15_000);
      const result = this.parseTransactionResponse(response);

      // T05 "son onaylı işlemi döndür" semantiğinde olabilir; cihaz başka bir
      // işlemin verisini dönebilir. Yankılanan ECRRefNum bizim sorguladığımızla
      // eşleşmiyorsa veriyi GÜVENMEYİP null döneriz — aksi halde reconcile yanlış
      // işlemi tamamlanmış sayar (yanlış müşterinin ödemesini ledger'a yazar).
      if (result.ecReferenceNumber !== ecReferenceNumber) {
        this.logger.warn(
          `PAX durum sorgusu ref uyuşmazlığı: beklenen=${ecReferenceNumber} gelen=${result.ecReferenceNumber ?? '∅'} — yanıt yok sayıldı`
        );
        return null;
      }

      return result;
    } catch (err) {
      this.logger.warn(
        `PAX durum sorgusu başarısız (firmware desteklemeyebilir): ecRef=${ecReferenceNumber} — ${(err as Error).message}`
      );
      return null;
    }
  }

  async batchClose(input: PaxBatchCloseInput): Promise<PaxBatchCloseResult> {
    const { device, timeout } = input;

    const packet = buildPacket(PAX_COMMANDS.BATCH_CLOSE, [
      PAX_PROTOCOL_VERSION,
      '', // ECRRefNum
      '', // extData
    ]);

    this.logger.log(`PAX batchClose — host=${device.host}`);
    const response = await this.sendPacket(
      device,
      packet,
      timeout ?? PAX_DEFAULT_TIMEOUT_MS
    );

    const { fields, isValid } = parsePacket(response);
    if (!isValid) {
      throw new PaxProtocolError(
        'Batch close yanıtı LRC doğrulamasından geçemedi'
      );
    }

    const responseCode = fields[0] ?? '';
    const responseText = fields[1] ?? '';

    return {
      success: responseCode === PAX_APPROVED_RESULT_CODE,
      responseCode,
      responseText,
      rawResponse: fieldsToRecord(fields),
    };
  }

  // ---------------------------------------------------------------------------
  // private helpers
  // ---------------------------------------------------------------------------

  /**
   * DoCredit (T01) yanıtı alan alanları:
   * [0] ResultCode  [1] ResultText  [2] AuthCode  [3] HostRefNum/Trace
   * [4] Batch  [5] TxnType  [6] ECRRefNum  [7] Issuer
   * [8] MaskedCardNum  [9] CardType  [10] HostAuthCode
   * (Firmware sürümüne göre ek alanlar gelebilir)
   */

  // TODO: firmware sürümleri kontrol edilecek ona göre DB oluşturulabilir
  private parseTransactionResponse(data: Buffer): PaxResult {
    const { fields, isValid } = parsePacket(data);

    if (!isValid) {
      throw new PaxProtocolError('PAX yanıtı LRC doğrulamasından geçemedi');
    }

    const responseCode = fields[0] ?? '';
    const responseText = fields[1] ?? '';
    const authorizationCode = fields[2] || undefined;
    const externalRef = fields[3] || undefined;
    const ecReferenceNumber = fields[6] || undefined;
    const maskedCardNumber = fields[8] || undefined;
    const cardType = fields[9] || undefined;

    return {
      approved: responseCode === PAX_APPROVED_RESULT_CODE,
      responseCode,
      responseText,
      authorizationCode,
      externalRef,
      ecReferenceNumber,
      maskedCardNumber,
      cardType,
      rawResponse: fieldsToRecord(fields),
    };
  }

  /**
   * Bir paketi terminale yollar ve yanıt paketini ham olarak döndürür.
   *
   * POSLink el sıkışması:
   *  1. ECR paketi yollar → terminal `ACK` (sağlam aldım) veya `NAK` (bozuk) döner.
   *  2. Terminal işi yapıp yanıt paketini (STX..ETX LRC) yollar.
   *  3. ECR yanıtı aldığını terminale `ACK` ile bildirir.
   *
   * Akış parça parça (chunk) geldiğinden, baştaki ACK byte'ı ile yanıt paketi
   * aynı veya ayrı chunk'larda gelebilir; bu yüzden tüm veriyi biriktirip
   * STX'e kadar olan handshake byte'larını ayıklarız.
   */
  private sendPacket(
    device: PaxDeviceConfig,
    packet: Buffer,
    timeoutMs: number
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const chunks: Buffer[] = [];
      let settled = false;
      let handshakeResolved = false; // baştaki ACK/NAK çözüldü mü

      const settle = (err?: Error, result?: Buffer) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        if (err) reject(err);
        else resolve(result!);
      };

      socket.setTimeout(timeoutMs);

      socket.on('timeout', () => {
        this.logger.warn(
          `PAX TCP timeout ${timeoutMs}ms — host=${device.host}:${device.port}. İşlem PENDING.`
        );
        settle(new PaxTimeoutError(timeoutMs));
      });

      socket.on('error', (err) => {
        this.logger.error(
          `PAX TCP error — ${err.message} host=${device.host}:${device.port}`
        );
        settle(
          new PaxConnectionError(`PAX bağlantı hatası: ${err.message}`, err)
        );
      });

      socket.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
        let combined = Buffer.concat(chunks);

        // 1) Handshake: yanıt paketinden (STX) önceki ACK/NAK byte'larını çöz
        if (!handshakeResolved) {
          const stxPos = combined.indexOf(PAX_STX);
          const nakPos = combined.indexOf(PAX_NAK);

          // STX'ten önce NAK geldiyse paket terminalce reddedilmiştir
          if (nakPos !== -1 && (stxPos === -1 || nakPos < stxPos)) {
            return settle(
              new PaxProtocolError('PAX: NAK — paket terminalce reddedildi')
            );
          }

          // Henüz STX gelmedi; baştaki ACK'leri tutup daha fazla veri bekle
          if (stxPos === -1) return;

          // STX bulundu — öncesindeki handshake byte'larını (ACK vb.) at
          handshakeResolved = true;
          combined = combined.subarray(stxPos);
          chunks.length = 0;
          chunks.push(combined);
        }

        // 2) Tam yanıt paketi: [STX] ... [ETX] [LRC]
        if (combined.length < 4 || combined[0] !== PAX_STX) return;

        const etxPos = combined.indexOf(PAX_ETX, 1);
        if (etxPos !== -1 && combined.length >= etxPos + 2) {
          const responsePacket = combined.subarray(0, etxPos + 2);
          // 3) Yanıtı sağlam aldığımızı terminale bildir (ACK), sonra kapat
          socket.write(Buffer.from([PAX_ACK]), () =>
            settle(undefined, responsePacket)
          );
        }
      });

      socket.on('close', () => {
        if (!settled) {
          settle(
            new PaxConnectionError(
              'PAX cihazı bağlantıyı kapattı, tam yanıt alınamadı'
            )
          );
        }
      });

      socket.connect(device.port, device.host, () => {
        this.logger.debug(
          `PAX bağlantı kuruldu — host=${device.host}:${device.port}`
        );
        socket.write(packet);
      });
    });
  }
}
