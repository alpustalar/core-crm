import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';
import {
  PAX_APPROVED_RESULT_CODE,
  PAX_COMMANDS,
  PAX_DEFAULT_TIMEOUT_MS,
  PAX_ETX,
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
import type { PaxDeviceConfig } from './types/pax-device-config.type';
import type {
  PaxBatchCloseInput,
  PaxBatchCloseResult,
  PaxRefundInput,
  PaxResult,
  PaxSaleInput,
  PaxVoidInput,
} from './types/pax-operation.types';

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
      formatAmount(amountInMinorUnits),
      '', // cashback
      '', // tip
      ecReferenceNumber,
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
      formatAmount(amountInMinorUnits),
      '', // cashback
      '', // tip
      ecReferenceNumber,
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
    const { device, ecReferenceNumber, originalReferenceNumber, timeout } =
      input;

    const packet = buildPacket(PAX_COMMANDS.DO_CREDIT, [
      PAX_PROTOCOL_VERSION,
      PAX_TRANS_TYPE.VOID,
      '', // amount — void'de gerekmez
      '', // cashback
      '', // tip
      ecReferenceNumber,
      `OrigRefNum=${originalReferenceNumber}`,
    ]);

    this.logger.log(
      `PAX void — ecRef=${ecReferenceNumber} origRef=${originalReferenceNumber} host=${device.host}`
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
   * Gerçek terminal testinden sonra komut kodu doğrulanmalıdır.
   */
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
      return this.parseTransactionResponse(response);
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
  private parseTransactionResponse(data: Buffer): PaxResult {
    const { fields, isValid } = parsePacket(data);

    if (!isValid) {
      throw new PaxProtocolError('PAX yanıtı LRC doğrulamasından geçemedi');
    }

    const responseCode = fields[0] ?? '';
    const responseText = fields[1] ?? '';
    const authorizationCode = fields[2] || undefined;
    const externalRef = fields[3] || undefined;
    const maskedCardNumber = fields[8] || undefined;
    const cardType = fields[9] || undefined;

    return {
      approved: responseCode === PAX_APPROVED_RESULT_CODE,
      responseCode,
      responseText,
      authorizationCode,
      externalRef,
      maskedCardNumber,
      cardType,
      rawResponse: fieldsToRecord(fields),
    };
  }

  private sendPacket(
    device: PaxDeviceConfig,
    packet: Buffer,
    timeoutMs: number
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const chunks: Buffer[] = [];
      let settled = false;

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
        const combined = Buffer.concat(chunks);

        // Paket: [STX] ... [ETX] [LRC]
        // Tam paketi aldığımızı ETX + LRC alındığında anlarız
        if (combined.length < 4 || combined[0] !== PAX_STX) return;

        const etxPos = combined.indexOf(PAX_ETX, 1);
        if (etxPos !== -1 && combined.length >= etxPos + 2) {
          settle(undefined, combined.slice(0, etxPos + 2));
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
