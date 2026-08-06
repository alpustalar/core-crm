import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { LeaveBalance as ILeaveBalance } from '@modules/hr/leave/domain/contracts/leave.contracts';

export interface LeaveYearPeriod {
  from: Date;
  to: Date;
}

export interface CalculateLeaveBalanceProps {
  /** Çalışanın yıllık izin hak edişi (gün). */
  entitlement: number;
  /** Dönem içinde onaylanmış ANNUAL izin günü toplamı. */
  usedDays: number;
}

/**
 * Yıllık izin bakiyesi. Hak ediş, kullanılan ve kalan gün ilişkisi ile izin yılının
 * sınırları burada tanımlıdır — handler'da değil. Düz sayılarla çalışır (entity
 * gerektirmez), bu yüzden hem okuma tarafı (bakiye sorgusu) hem yazma tarafı
 * (onayda bakiye guard'ı) aynı hesabı kullanabilir.
 */
export class LeaveBalance {
  private constructor(
    private readonly _entitlement: number,
    private readonly _used: number
  ) {}

  get entitlement(): number {
    return this._entitlement;
  }

  get used(): number {
    return this._used;
  }

  /** Kalan gün. Hak edişten fazla kullanım mümkün olduğu için negatif olabilir. */
  get remaining(): number {
    return this._entitlement - this._used;
  }

  static calculate(props: CalculateLeaveBalanceProps): LeaveBalance {
    return new LeaveBalance(props.entitlement, props.usedDays);
  }

  /**
   * Verilen anın ait olduğu izin yılı (varsayılan: şimdi). İzin yılı = takvim yılı.
   * Kural burada tekil: "hak ediş hangi dönemin kullanımına karşılık geliyor"
   * cevabı değişirse (ör. işe giriş yıl dönümü) yalnız burası değişir.
   */
  static periodOf(date: Date = DateTimeManager.create()): LeaveYearPeriod {
    const year = DateTimeManager.getYear(date);
    return {
      from: DateTimeManager.startOfYear(year),
      to: DateTimeManager.endOfYear(year),
    };
  }

  /** Talep edilen gün sayısı bakiyeyi aşıyor mu? */
  public exceeds(requestedDays: number): boolean {
    return requestedDays > this.remaining;
  }

  public toView(): ILeaveBalance {
    return {
      entitlement: this._entitlement,
      used: this._used,
      remaining: this.remaining,
    };
  }
}
