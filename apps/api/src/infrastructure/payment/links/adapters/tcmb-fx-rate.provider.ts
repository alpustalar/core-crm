import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { IFxRateProvider } from '../fx-rate.port';
import { StaticEnvFxRateProvider } from './static-env-fx-rate.provider';

interface CachedRate {
  rate: number;
  /** epoch ms; geçmiş (immutable) tarihler için Infinity, bugün için kısa TTL. */
  expiresAt: number;
}

/**
 * TCMB günlük döviz kuru sağlayıcı — statutory kaynak (VUK: değerlemede TCMB döviz **alış**
 * kuru). Posting `asOf` (işlem tarihi) geçtiğinde o güne ait kuru kullanır; böylece yabancı
 * işlemler fonksiyonel paraya işlem-tarihli kurla çevrilir (anlık kur değil).
 *
 * Kaynak: `https://www.tcmb.gov.tr/kurlar/today.xml` (bugün) veya
 * `.../kurlar/YYYYMM/DDMMYYYY.xml` (geçmiş gün). Kurlar gün-içinde değişmez → in-memory cache
 * (geçmiş gün süresiz, bugün kısa TTL). Çok-instance dağıtımda her instance kendi cache'ini
 * tutar; TCMB çağrısı ucuz olduğundan kabul edilir (Redis'e coupling'den kaçınıldı).
 *
 * Herhangi bir hata (ağ, parse, hafta sonu/tatil dosyası yok, para birimi eksik) → statik env
 * sağlayıcıya (fallback) düşer; o da çözemezse hata yükselir (çağıran graceful degrade eder).
 */
@Injectable()
export class TcmbFxRateProvider implements IFxRateProvider {
  private readonly logger = new Logger(TcmbFxRateProvider.name);
  private readonly cache = new Map<string, CachedRate>();

  private static readonly BASE_URL = 'https://www.tcmb.gov.tr/kurlar';
  private static readonly TIMEOUT_MS = 4000;
  private static readonly TODAY_TTL_MS = 30 * 60 * 1000; // 30 dk

  constructor(private readonly fallback: StaticEnvFxRateProvider) {}

  async getRate(
    from: CurrencyType,
    to: CurrencyType,
    asOf?: Date
  ): Promise<number> {
    if (from === to) return 1;

    // TCMB tüm kurları TRY üzerinden verir. Hedef TRY değilse TRY üzerinden triangüle et.
    if (to !== 'TRY') {
      const [fromTry, toTry] = await Promise.all([
        this.getRate(from, 'TRY', asOf),
        this.getRate(to, 'TRY', asOf),
      ]);
      return fromTry / toTry;
    }

    if (from === 'TRY') return 1;

    try {
      return await this.resolveTryRate(from, asOf);
    } catch (err) {
      this.logger.warn(
        `TCMB kuru çözülemedi (${from}→TRY, asOf=${
          asOf ? DateTimeManager.toDateKey(asOf) : 'today'
        }): ${
          err instanceof Error ? err.message : err
        } — statik env fallback deneniyor.`
      );
      return this.fallback.getRate(from, to, asOf);
    }
  }

  /** Belirli gün için `from`→TRY döviz alış kurunu (cache'li) çözer. */
  private async resolveTryRate(
    from: CurrencyType,
    asOf?: Date
  ): Promise<number> {
    const { url, dateKey, isToday } = this.resolveUrl(asOf);
    const cacheKey = `${dateKey}:${from}`;

    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.rate;
    }

    const xml = await this.fetchXml(url);
    const rate = this.extractForexBuying(xml, from);

    this.cache.set(cacheKey, {
      rate,
      expiresAt: isToday
        ? Date.now() + TcmbFxRateProvider.TODAY_TTL_MS
        : Number.POSITIVE_INFINITY,
    });
    return rate;
  }

  /**
   * asOf bugün/verilmemişse `today.xml`; geçmiş günse `YYYYMM/DDMMYYYY.xml`. Tarih anahtarları
   * İstanbul yerel takvimine göre (TCMB yerel yayınlar).
   */
  private resolveUrl(asOf?: Date): {
    url: string;
    dateKey: string;
    isToday: boolean;
  } {
    const now = DateTimeManager.create();
    const isToday = !asOf || DateTimeManager.isSameDay(asOf, now);

    if (isToday) {
      return {
        url: `${TcmbFxRateProvider.BASE_URL}/today.xml`,
        dateKey: DateTimeManager.toCompactDateKey(now),
        isToday: true,
      };
    }

    const folder = DateTimeManager.toCompactMonthKey(asOf!);
    const file = DateTimeManager.toCompactDateKey(asOf!);
    return {
      url: `${TcmbFxRateProvider.BASE_URL}/${folder}/${file}.xml`,
      dateKey: file,
      isToday: false,
    };
  }

  private async fetchXml(url: string): Promise<string> {
    const res = await axios.get<string>(url, {
      timeout: TcmbFxRateProvider.TIMEOUT_MS,
      responseType: 'text',
      // Hafta sonu/tatilde dosya yok → 404; catch edilip fallback'e düşülür.
      headers: { Accept: 'application/xml,text/xml' },
    });
    return res.data;
  }

  /**
   * TCMB XML'inde ilgili `<Currency CurrencyCode="XXX">` bloğundan `<ForexBuying>`'i çeker ve
   * `<Unit>`'e böler (bazı para birimleri 100 birim kotasyonludur; EUR/USD/GBP için 1). Değer
   * boş/geçersizse hata → fallback.
   */
  private extractForexBuying(xml: string, currency: CurrencyType): number {
    const block = new RegExp(
      `<Currency[^>]*CurrencyCode="${currency}"[^>]*>([\\s\\S]*?)</Currency>`,
      'i'
    ).exec(xml);
    if (!block) {
      throw new Error(`TCMB XML'inde ${currency} bulunamadı.`);
    }

    const buyingMatch = /<ForexBuying>([\d.]+)<\/ForexBuying>/i.exec(block[1]);
    const unitMatch = /<Unit>(\d+)<\/Unit>/i.exec(block[1]);

    const buying = buyingMatch ? Number(buyingMatch[1]) : NaN;
    const unit = unitMatch ? Number(unitMatch[1]) : 1;

    if (!Number.isFinite(buying) || buying <= 0 || !Number.isFinite(unit) || unit <= 0) {
      throw new Error(`TCMB ${currency} döviz alış kuru geçersiz/boş.`);
    }

    return buying / unit;
  }
}
