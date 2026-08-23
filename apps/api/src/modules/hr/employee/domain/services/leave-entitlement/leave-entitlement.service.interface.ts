import { LeaveEntitlement } from '@modules/hr/employee/domain/value-objects/leave-entitlement.vo';

export const EMPLOYEE_LEAVE_ENTITLEMENT_SERVICE = Symbol(
  'IEmployeeLeaveEntitlementService'
);

export interface IEmployeeLeaveEntitlementService {
  /**
   * Çalışanın satırını `FOR UPDATE` kilitler **ve** yıllık izin hak edişini aynı
   * çağrıda döndürür. Yalnız aktif transaction içinde çağrılır.
   *
   * **Neden tek metot?** Kilit alma ile kilitli veriyi okuma ayrı metotlara bölünürse
   * sırayı bozmak ya da kilidi atlamak derleyicinin göremediği bir hata olur; bakiye
   * kararı sessizce kilitsiz veriyle verilir. Tek atomik metot bu ihtimali sıfırlar —
   * `lockAndGet` öneki de kilidin varlığını çağrı yerinde görünür kılar.
   *
   * **Neden yazma tarafına ait?** Dönen değer bir yazma kararını besler (izin onayı),
   * dolayısıyla okuma Command Repository'den ve kilit kapsamı içinden yapılır.
   *
   * Yetki kontrolü **çağıran handler'ın** sorumluluğundadır; bu servis yetki
   * değerlendirmez (izin onayında aktör zaten `canManageClinicHr` ile doğrulanır).
   *
   * @throws EmployeeNotFoundException — çalışan yoksa (kilitlenecek satır da yok).
   */
  lockAndGetAnnualEntitlement(employeeId: string): Promise<LeaveEntitlement>;
}
