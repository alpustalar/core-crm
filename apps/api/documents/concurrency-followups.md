# Eşzamanlılık — Sonraki Plan

2026-08-12 kilit turunda **bilinçli olarak açık bırakılan** işler. Tamamlanan tur için
CLAUDE.md'deki "Concurrency Control" bölümüne ve ilgili `*.handler.spec.ts` dosyalarına bakılır.

---

## 1. POS void/refund — orijinal işlem bağı + unique kısıt ✅ (2026-08-13)

**Sorundu.** Void/iade kayıtları orijinal satışa bağlı değildi ve satışın durumunu
değiştirmiyordu (`SUCCESS` kalıyordu). İki eşzamanlı iptal isteğinden ikincisi kilidi
aldığında "bu satış daha önce iptal edildi mi" sorusunu soracak veri yoktu → cihaza
ikinci kez void gidebiliyordu. Kilit yalnız doğrulamayı eşzamanlı değiştiricilerden
(mutabakat taraması, cihaz callback'i) yalıtıyordu.

**Yapılan.**

1. **Şema** (`schema/pos.prisma`) — `PosTransactionKind` enum (`SALE | VOID | REFUND`) +
   `PosTransaction.kind`, `originalPosTransactionId` (self-relation + index) ve
   `activeVoidOriginalId` (`@unique`).

   > **Kısmi iade tuzağı — planda gözden kaçmıştı.** İade **kısmi** olabiliyor
   > (`input.amount`), yani bir satışın birden çok canlı iade kaydı meşrudur. Ters
   > kayıtların tümünü kapsayan tek bir `@@unique([originalPosTransactionId])` bu
   > senaryoyu bloklardı. Bu yüzden kısıt yalnız **iptali** hedefler ve `kind` ayrımı
   > eklendi; iadelerde koruma kümülatif tutar kontrolüdür (madde 4).

   > **Partial index nasıl uygulandı.** Onaylanan semantik "kısıt yalnız CANLI
   > (`PENDING`/`SUCCESS`) kayıtlara uygulansın, başarısız denemeden sonra tekrar
   > denenebilsin" idi. Raw SQL `CREATE UNIQUE INDEX ... WHERE status IN (...)` Prisma
   > şemasında ifade edilemediği için ileride üretilecek bir migration bu index'i
   > **sessizce DROP** edebilirdi (para güvenliği kısıtının fark edilmeden kaybı).
   > Onun yerine aynı semantik, Prisma'nın gördüğü bir kolonla kuruldu:
   > `activeVoidOriginalId` yalnız canlı iptal kaydında doludur, iptal
   > FAILED/CANCELLED/TIMEOUT olduğunda `null`'a çekilir; Postgres'te NULL'lar
   > birbiriyle çakışmadığı için `@unique` tam olarak partial index gibi davranır.

2. **Entity.** `kind` + `originalPosTransactionId` + `activeVoidOriginalId` alanları,
   getter'lar, `toPersistence`. `create` ters kayıtta orijinal id'yi zorunlu kılar
   (`PosTransactionReversalRequiresOriginalException`); VOID kaydı kilidi **PENDING
   doğduğu andan** tutar (cihaz çağrısı sürerken gelen ikinci istek kısıta takılsın).
   `markFailed` / `markCancelled` / `markTimeout` kilidi bırakır → tekrar denenebilir.
   `update()` bu alanı yazar (yazmasaydı kilit DB'de takılı kalır, satış bir daha hiç
   iptal edilemezdi).

3. **Repository.** `findLiveReversalSummary(originalId)` → `{ hasActiveVoid, refundedAmount }`
   (Command Context; orijinal satır `FOR UPDATE` kilitliyken okunur). `create()` P2002'yi
   `PosTransactionAlreadyReversedException`'a (409) çevirir — `invoice.command.repository`
   kalıbının aynısı.

4. **Handler'lar (4 adet).** Faz 1 kilidinin içinde, ters kayıt açılmadan hemen önce:
   - **void** (`pax-void`, `iyzico-terminal-void`): canlı iptal **veya** herhangi bir canlı
     iade varsa `PosTransactionAlreadyReversedException`.
   - **refund** (`pax-refund`, `iyzico-terminal-refund`): canlı iptal varsa aynı hata;
     tutar kontrolü **kümülatif** (`önceki iadeler + yeni > satış` → `RefundAmountExceedsOriginalException`).
     Eski kontrol her iadeye tek tek baktığı için **art arda iki tam iade** (yarış bile
     gerekmeden) geçebiliyordu — bu da kapandı.

5. **Test.** `pos-transaction.entity.spec.ts` (kilit yaşam döngüsü) + 4 handler spec'i
   (ikinci iptal reddedilir & cihaza gidilmez, kısmi iade sınırı, kilitli okuma / kilitsiz
   dış çağrı derinliği). POS: 6 suite / 38 test yeşil.

**Yan bulgu — düzeltildi.** `pax-void` ve `pax-refund` cihaza gönderilecek tutarı
`Number(originalTx.amount)` ile hesaplıyordu; `amount` bir `Money` VO'su olduğu ve
`valueOf` tanımlamadığı için sonuç **NaN**'dı (`Math.round(NaN * 100)` → NaN). `.value`
(Decimal) üzerinden hesaplanacak şekilde düzeltildi ve `Money` şemasına `isFinite`
kontrolü eklendi — `new Decimal(NaN).isNegative()` false döndüğü için mevcut negatiflik
kontrolü NaN'ı yakalamıyordu.

**Migration:** `20260813090000_pos_reversal_link` — **kullanıcı uygular** (`pnpm migrate:dev`).
Mevcut satırlar `kind = 'SALE'` alır; geçmişteki void/iade kayıtları geriye dönük olarak
ayrıştırılamaz (bağ kolonu o dönemde yoktu).

---

## 2. Sessiz kilit no-op'u + singleton handler bağlam sızıntısı ✅ (2026-08-16)

**2a. `lockRowForUpdate` var olmayan satırda sessizce etkisizdi.** Teşhis üç ayrı
senaryoya bölündü; hepsine aynı çözüm uygulanmadı:

| Senaryo | Karar |
| --- | --- |
| `findByIdForUpdate` (kilitlenen satır hemen okunuyor) | **Değişmedi.** Satır yoksa okuma `null` döner, handler modüle özgü tipli `*NotFoundException` fırlatır. Repo'dan jenerik hata fırlatmak "kayıt yok" (domain, 404) ile "kilit alınamadı" (altyapı) durumlarını tek koda çökertir ve frontend'in kancalandığı `errorCode`'u kaybederdi. |
| **Çapa kilidi** (satır kilitleniyor ama **okunmuyor**) | **Düzeltildi.** Yokluğu başka hiçbir yerde fark edilmediği için akış korumasız devam ediyordu. |
| Insert yarışı (satır henüz yok) | **`FOR UPDATE` bunu zaten çözemez.** Mevcut çözümler doğru: ebeveyn çapası (`open-cash-session` → `cash_registers`) veya unique kısıt (5 yerde). Advisory lock'a gidilmedi: `hashtext` çakışması sessiz yanlış serileştirme üretir ve kilit şemaya bakan kimseye görünmez. |

`BaseRepository.lockRowForUpdate` artık **`boolean`** döner (kilit gerçekten alındı mı) ve
`$executeRaw` yerine **`$queryRaw`** kullanır — `$executeRaw` yazma işlemleri için
tasarlanmıştır, `SELECT` ile dönüş değeri sözleşmeye bağlı değildir. Çapa kilitleri için
`lockRowForUpdateOrFail` eklendi → `LockTargetMissingException` (422,
`COMMON.LOCK_TARGET_MISSING`). İki çağrı geçirildi: `lockEmployeeLeaveBalance` (izin
bakiyesi) ve `lockResourceCapacity` (proje kaynağı — `resourceId` **kullanıcı girdisi**,
uydurma id'de kapasite kuralı korumasız çalışıyordu).

**2b. `approve-leave` singleton handler'da istek-başı bağlam tutuyordu.** `public
internalCtx` alanı `createInternal(ctx)` ile **gerçek aktörün** kimliğini taşıyordu
(`ExecutionContextFactory` `parentContext.actor`'ü aynen kopyalar). NestJS handler'ları
singleton olduğu için ilk istek `findByIdForUpdate`'te beklerken ikinci istek alanı
eziyor, birinci istek dönüşte hak ediş okumasını **yanlış aktörle** yapıyordu —
`GetEmployeeByIdHandler` o bağlamla `canAccessClinicHr` yetki kontrolü çalıştırdığı için
eşzamanlı onaylarda rastgele 403'ler ya da istek sahibinin kapsamı dışına taşan okuma.
Alan kaldırıldı, bağlam parametreyle taşınıyor.

> Diğer 15 handler'daki `internalCtx` **güvenli**: hepsi `private readonly` ve
> argümansız `createInternal()` — yani sabit `SYSTEM_ACTOR`. Tek aykırı dosya buydu.

**Test.** `base.repository.spec.ts` (yeni: boolean dönüş, `$queryRaw` kullanımı, tx dışı
çağrıda patlama, `OrFail` davranışı) + `approve-leave.handler.spec.ts`'e eşzamanlılık
regresyonu (iki istek farklı aktörlerle, ilki bilerek askıda tutulur). Regresyon testi eski
kodda **kırmızı** olduğu doğrulandı.

---

## 3. Kilitli hak ediş servisi + devreden/yıl-aşan izin bakiyesi ✅ (2026-08-16)

Madde 2'den devreden iki borç ile izin bakiyesinin domain doğruluğu **birlikte** kapatıldı:
hak edişin dönüş tipi devreden hakkı modellemeden belirlenemezdi, önce `number` yazıp sonra
VO'ya çevirmek gereksiz churn olurdu.

**3a. `lockAndGetAnnualEntitlement` — kilit ve okuma tek atomik metotta.**
`hr/employee/domain/services/leave-entitlement/` altında token'lı yaprak servis
(`EMPLOYEE_LEAVE_ENTITLEMENT_SERVICE`). Üç şeyi birden kapatır:

- Hak ediş artık QueryBus'tan değil, **Command Repository**'den ve **kilit kapsamı içinden**
  okunuyor (read-replica'ya geçişte stale okuma riski kalktı).
- Çapa kilidi tabloyu **sahibi olan modüle** taşındı: `leave` repo'su artık `employees`
  tablosunu ham SQL ile kilitlemiyor (`lockEmployeeLeaveBalance` kaldırıldı,
  `EmployeeCommandRepository.findByIdForUpdate` geldi).
- Kilit alma ile kilitli veriyi okuma **bölünemez**: ayrı metotlar olsaydı sırayı bozmak
  derleyicinin göremediği bir hata olurdu. CLAUDE.md'ye "kilitli skaler okuma" istisnası
  olarak yazıldı (`lockAndGet*` adlandırması, dönüş skaler/VO, yetki çağıranda).

**3b. Devreden hak (4857/53-54).** Bakiye yalnız içinde bulunulan yılın hak edişine bakıyordu;
kullanılmayan yıllık izin yanmadığı için bu çalışanın kazanılmış hakkını siliyordu. Hesap artık
hak edişin doğduğu ilk yıldan itibaren yıl yıl yürüyor:
`devreden(y) = max(0, devreden(y-1) + hakEdiş(y) − kullanılan(y))`. Taban 0'da kırpılır — bir
yılda fazla kullanım ertesi yılın hakkını götürmez. Hak ediş işe giriş yılının **ertesi**
yılında doğar (kıdem 1 yılı dolmadan yıllık izin hakkı yoktur).

**3c. Yıl aşan izinler.** `startDate: { gte: from, lte: to }` filtresi 28 Aralık – 5 Ocak gibi
izinleri yanlış sayıyordu: tüm günler başlangıç yılına yazılıyor, ertesi yılın sorgusunda izin
hiç görünmüyordu. Repo artık **kesişen** izinleri döndürüyor (`startDate <= to AND endDate >= from`)
ve gün dağıtımı domain'de yapılıyor — `SUM` bu kuralı ifade edemez, bu yüzden metot toplam değil
**aralık** döndürüyor (`findApprovedAnnualLeaves`, `sumApprovedAnnualDays` kaldırıldı).

**Yeni tipler.** `LeaveEntitlement` VO (`hr/employee` — hak ediş çalışanın verisi),
`LeaveBalance.accrue()` (`hr/leave` — kullanımla birleştirme). Sorumluluk ayrımı iki modülün
birbirinin deposuna uzanmasını gereksiz kılıyor. Read-model `accrued` + `carriedOver` alanlarıyla
genişledi (`entitlement` artık devreden dahil toplam).

**Bilinen sınır — hak ediş geçmişi saklanmıyor.** `Employee` tek bir güncel
`annualLeaveEntitlement` taşır. Kıdeme bağlı artışlar (14 → 20 → 26) geriye dönük bilinemediği
için devreden hesabı geçmiş yıllarda da güncel hak edişi kullanır; İK sayıyı değiştirirse geçmiş
yıllar yeni değerle yeniden hesaplanır. Tam doğruluk için yıl-bazlı hak ediş geçmişi
(`EmployeeLeaveEntitlementHistory`) gerekir — ayrı bir iş, migration + backfill ister.

**Test.** `leave-entitlement.vo.spec.ts` (6), `leave-entitlement.service.spec.ts` (2),
`leave-balance.vo.spec.ts` yeniden yazıldı (14 — devreden, 0'da kırpma, yıl aşan izinlerin
her iki yöne bölünmesi), `approve-leave.handler.spec.ts` yeni mimariye uyarlandı (6).

> **Not — madde 2b'nin regresyon testi kaldırıldı.** Handler artık hak ediş için QueryBus
> kullanmadığından istek-başı bağlam taşımıyor; test edilecek sızıntı yüzeyi yapısal olarak
> yok oldu. Bağlam sızıntısına karşı asıl koruma o testte değil, "handler'da istek-başı alan
> tutma" kuralında.

---

## 4. Küçük boşluklar (sıraya alınmadı)

- **`AppointmentAlreadyInvoicedException.errorCode`** bilinçli olarak
  `TREATMENT_CHARGE.ALREADY_INVOICED` bırakıldı (frontend sözleşmesi bozulmasın).
  Frontend tarafı hazır olduğunda `INVOICE.APPOINTMENT_ALREADY_INVOICED`'a taşınabilir.
- **`reconcile-pos-transactions` `kind` ayrımı yapmıyor.** PENDING kalan void/iade
  kayıtları da satış gibi taranıyor; davranış bugüne dek doğru çalıştığı için
  dokunulmadı, ama `kind` artık mevcut olduğuna göre tarama daraltılabilir.
