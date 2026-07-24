# Ürün Release Planı — Durum Takibi

> Kaynak: kullanıcının ~2 ay önceki 9-gruplu release planı. Bu dosya **kod üzerinden doğrulanmış**
> güncel durumu tutar. Durum: ✅ tamam · 🟡 kısmi · 🔴 eksik.
> Son denetim: 2026-07-13.

## Özet Tablo

| Grup | Konu | Durum |
| --- | --- | --- |
| 1.1 | Satış CRM (Lead/Pipeline/Activity/Attribution) | ✅ |
| 1.2 | Randevu — sağlık turizmi (otel/dil/para) | 🟡 (uçuş takibi 🔴) |
| 1.3 | Onam Formu (tablet imza + klinik şablon yönetimi) | ✅ (nitelikli e-imza hariç — bkz. 9.4) |
| 2.1 | Omnichannel (WA/IG/Telegram) | 🟡 (Messenger 🔴) |
| 2.2 | AI mesaj desteği | ✅ (backend) |
| 3.1 | Meta Ads (OAuth/lead form/metrics) | ✅ |
| 3.2 | Ajans ROI takibi | ✅ (klinik-bazlı — tasarım gereği) |
| 4.1 | Muhasebe (ledger + çift taraflı) | ✅ (kasa+köprü ✅; banka+mutabakat ✅ manuel — oto-eşleştirme 🟡) |
| 4.2 | E-Fatura/E-SMM | 🟡 (port/queue var, gerçek adapter 🔴) |
| 4.3 | Vergi/raporlama (KDV/P&L) | ✅ (rapor paketi tam; dönem karşılaştırması opsiyonel) |
| 5.1 | Satın alma (talep/onay/PO/mal-kabul) | ✅ (fatura eşleştirme 🟡) |
| 5.2 | Stok (inventory) | ✅ |
| 6.1 | Personel (Employee/Contract) | ✅ (EmployeePolicy authz + alan serileştirme + hire/terminate/salary audit event) |
| 6.2 | İzin (request/approve/balance) + Devam/mesai | ✅ (authz + bakiye guard; attendance check-in/out + fazla mesai) |
| 6.3 | Bordro (payroll) | ✅ |
| 7 | Üretim (iş emri/lab) | 🔴 |
| 8 | Proje yönetimi | 🔴 |
| 9.1 | E-nabız | 🟡 (yalnız schema `enabiz.prisma`) |
| 9.2 | E-reçete | 🔴 |
| 9.3 | E-rapor | 🔴 |

## Detay

### GRUP 1 — Temel CRM ✅
- **1.1 Satış CRM** ✅ — Lead (form/WA/manuel), Pipeline+PipelineStage (klinik-başı, Kanban), Activity (call/note/task/meeting), Lead→hasta dönüşüm (convert + **patientId yoksa lead telefon+isminden otomatik idempotent CRM hasta oluşturma**, CreatePatientCommand; WON aşama senkronu), kaynak attribution (LeadSource/medium/CTWA). `crm/lead`, `crm/pipeline`, `crm/activity`.
- **1.2 Randevu (sağlık turizmi)** 🟡 — otel önerisi (HotelBeds, ödeme-first saga) ✅, dil/para (multi-currency + messaging çok-dil) ✅. **Uçuş takibi 🔴.**
- **1.3 Onam Formu** ✅ — yeni `clinical/consent-form` modülü (2026-07-22): **`ConsentFormTemplate`** (klinik-bazlı, opsiyonel sectorId, title+content, `version` sadece içerik değişince artar — sadece sectorId değişimi versiyonu etkilemez, entity spec testinde doğrulandı) + **`ConsentFormSubmission`** (hasta tablette imzalar; `templateVersion`+`templateTitleSnapshot`+`templateContentSnapshot` donmuş kopya taşır — şablon sonradan değişse bile hastanın imzaladığı metin bozulmaz; `signatureImage` base64 `@db.Text`, gerçek blob storage yok çünkü projede hiç yok; immutable — `updatedAt` yok). Akış **staff-authenticated** (tablet klinik-sahipli cihaz, Patient'ın kendi login sistemi yok): personel hastayı+formu seçer, imza yakalanır. Yeni `ConsentFormPolicy` (manage=klinik yöneticisi template CRUD; access=aynı klinik personeli imza+görüntüleme) + `PolicyFactory.consentForm()`. Audit event **sadece Template CRUD'da** (create/update/archive, 3-adım kural) — imzalama audit event almadı çünkü Submission satırının kendisi zaten tam kayıt (attendance check-in emsali). Cross-module: `patientId` `FindPatientByIdQuery` ile doğrulanır; `appointmentId`/`treatmentId` v1'de doğrulanmaz (serbest referans, YAGNI). Migration uygulandı (2026-07-22 — consent_form_templates + consent_form_submissions tabloları). **Nitelikli e-imza entegratörü (5070 sayılı kanun kapsamında hukuken bağlayıcı e-imza) çok sonraya ertelendi** — bkz. 9.4.

### GRUP 2 — İletişim/Mesajlaşma 🟡
- **2.1 Omnichannel** 🟡 — WhatsApp ✅, Instagram DM ✅, Telegram ✅ (Messenger yerine eklendi), ortak inbox (ChannelRouter) ✅ backend, konuşma→Lead (CTWA) ✅. **Facebook Messenger 🔴.**
- **2.2 AI mesaj desteği** ✅ (backend) — Claude + Gemini (klinik-başı sağlayıcı), çok-dil, intent, randevu/turizm araçları. UI onay akışı FE tarafında.

### GRUP 3 — Dijital Reklam Paneli 🟡
- **3.1 Meta Ads** ✅ — OAuth connect/callback/refresh, process-meta-lead, match-lead-to-patient, sync-campaign-metrics, get-meta-report/accounts/leads. Lead form → otomatik Lead köprüsü + attribution.
- **3.2 Ajans ROI** ✅ — `get-agency-roi-report` (meta-ads): kampanya harcaması (MetaCampaignMetric) vs. reklam-atıflı dönüşen hastaların dönem geliri (FinanceLedger INCOME). Zincir: kampanya → Lead (campaignId→patientId) → FinanceLedger. ROAS/ROI%/net kâr + kampanya kırılımı + önceki eşit dönemle karşılaştırma (deltas). Cross-module: `GetAdAttributedLeadsQuery` (lead) + `GetRevenueByPatientsQuery` (finance-ledger). Endpoint `GET meta-ads/clinics/:clinicId/roi`. Ajans harcama raporları **tasarım gereği klinik-bazlı** (org roll-up gerekmiyor).

### GRUP 4 — Finans ✅ (E-Belge gerçek adapter hariç)
- **4.1 Muhasebe** 🟡 — finance-ledger + accounting (çift taraflı, işlem-tarihli FX, Model A çok-para) ✅. **Kasa (cash register) ✅** — yeni `finance/cash-register` modülü: CashRegister (kasa CRUD + arşiv) + CashSession (aç/kapa; açılış nakdi, kapanışta fiziki sayım → beklenen/fark hesabı) + CashMovement (nakit giriş/çıkış, yön türden türetilir, açık oturum zorunlu). Endpoint kökü `cash/registers/*` + `cash/sessions/*`. Authz `FinancePolicy` (görüntüle = aynı klinik, yaz/aç/kapa = yönetici). Şema `cash.prisma` (generate edildi). **Kasa→muhasebe köprüsü ✅** — oturum kapanışında tek özet FinancialEvent (`CASH_SESSION_CLOSED`) → `CashSessionClosedRule` posting kuralı: bankaya yatırma `B 102/A 100`, nakit gider `B 770/A 100`, sayım fazlası `B 100/A 679`, açık `B 689/A 100`. **SALE_COLLECTION postlanmaz** (Payment modülü zaten 100 Kasa'ya işliyor → mükerrer yok). `dedupeKey=cash-session-closed:{id}` idempotent + `CashSession.accountingEventId/postedToAccountingAt` izi (`markAsPostedToAccounting`), `outboxRun` atomik. Yeni `679` hesabı plana eklendi. **⚠️ Migration uygulanmadı** (`pnpm migrate:dev` — cash tabloları + `CASH_SESSION_CLOSED` enum + session köprü alanları). **Banka hesabı + ekstre mutabakatı ✅** — yeni `finance/bank` modülü: **BankAccount** (IBAN/banka/para birimi/açılış bakiyesi CRUD + arşiv) + **BankStatement** (ekstre import — API'siz: frontend CSV'yi parse edip JSON satır yollar) + **BankStatementLine** (mutabakat: `UNMATCHED/MATCHED/IGNORED`, eşleştir/yoksay/geri-al + matchedRef izi) + mutabakat özeti (matched/unmatched/ignored sayı + tutar). Endpoint kökü `bank/accounts/*` + `bank/statements/*`. Authz `FinancePolicy`. **Muhasebe posting'i YOK** — 102 Bankalar zaten payment/kasa köprüsünden besleniyor; bu modül postlamaz, yalnızca mutabakat yapar (mükerrer önlenir). **⚠️ Migration uygulanmadı** (`pnpm migrate:dev` — bank tabloları). **Oto-eşleştirme (102 defterine karşı amount+tarih) 🟡** sonraki adım — manuel taban kuruldu.
- **4.2 E-Fatura/E-SMM** 🟡 — `e-document` port/adapter + Noop + BullMQ kuyruk ✅. **Gerçek Dia/Nilvera adapter + FilingExportPort 🔴** (dış kimlik gerektirir).
- **4.3 Vergi/raporlama** ✅ — `tax.prisma` + KDV posting + **tam resmî rapor paketi** `GET accounting/reports/*`: `income-statement` (Gelir Tablosu/P&L — TDHP yapılı, tarih aralıklı, POSTED fişlerden net satış→brüt kâr→faaliyet kârı→dönem net kârı), `balance-sheet` (Bilanço), `cash-flow` (Nakit Akış), `vat-declaration` (KDV Beyannamesi), `trial-balance` (Mizan), `journal` (Yevmiye), `ledger` (Defter-i Kebir). Saf domain calculator'lar (`income-statement.calculator.ts` vb.). **Opsiyonel geliştirme: P&L dönem karşılaştırması (bu dönem vs. önceki dönem) — Ajans ROI'deki gibi.**

### GRUP 5 — Satın Alma & Stok ✅
- **5.1 Satın alma** ✅ — yeni `supply/purchasing` modülü: **PurchaseRequest** (talep→onay/ret/iptal, SUBMITTED→APPROVED→ORDERED) + **PurchaseOrder** (DRAFT→SENT→PARTIALLY/RECEIVED, kalem satırları + net/KDV/toplam) + **mal kabul** (kısmî teslim → katalog ürünü satırları `ReceiveStockCommand` ile stok girişi tetikler, cross-module). Tedarikçi zaten `supply/inventory`'de (Supplier CRUD). Authz `PurchasingPolicy` (talep/görüntüle = aynı klinik, onay/PO/mal-kabul = yönetici). Şema `purchasing.prisma` — **migration uygulandı (2026-07-18)**. **Fatura eşleştirme (PO↔PurchaseInvoice) 🟡 ertelendi.**
- **5.2 Stok** ✅ — `supply/inventory`.

### GRUP 6 — İnsan Kaynakları ✅ (attendance hariç)
- **6.1 Personel (Employee)** ✅ — `hr/employee` modülü: Employee + EmployeeContract entity/repo/CQRS, create/update/terminate/add-contract, get-by-id/list. Migration `20260716000650_add_hr_employee_leave`. **Authz: `EmployeePolicy`** (staff PolicyFactory `.employee()`) — yazma klinik yöneticisi (`canManageClinicHr`). **Alan-bazlı serileştirme:** `EmployeeResponseDto` + `@Serialize` interceptor + `getSerializationOptions` → okuma (liste/detay) aynı-klinik personeline gevşetildi (`canAccessClinicHr`); nationalId → MANAGEMENT/ADMIN, maaş/sözleşme → FINANCIAL/MANAGEMENT/ADMIN grubu, temel alanlar herkese. **Hire/terminate/salary audit event ✅ (2026-07-22)** — `EmployeeHiredEvent`/`EmployeeTerminatedEvent`/`EmployeeSalaryChangedEvent` (domain/events) + `EmployeeEventPublisher` (contextService.addEvent) + 3 listener (`AuditLogService.info`/`security`), 3 adım kural izlendi. create/terminate/add-contract handler'ları event publisher'ı çağırıyor.
- **6.2 İzin** ✅ — `hr/leave` modülü: request/approve/reject/cancel + `get-leave-balance` (entitlement sabit, kullanılan onaylı ANNUAL günden hesaplanır). Authz EmployeePolicy ile (onay/ret = manage, request/cancel = access). **ANNUAL approve'da kalan bakiye guard'ı eklendi** (`LeaveInsufficientBalanceException`). **Devam/mesai (attendance) ✅** — yeni `hr/attendance` modülü: çalışan kendi check-in/check-out'u yapar (`AttendanceRecord`, çalışan+gün başına tek kayıt), HR `RecordAttendanceCommand` ile geçmişe dönük manuel düzeltme/backfill yapabilir (doğal anahtar upsert: employeeId+workDate). Giriş/çıkıştan `workedMinutes` + 8 saat (480 dk) üzeri `overtimeMinutes` otomatik hesaplanır. `get-attendance-by-employee` (liste) + `get-attendance-summary` (dönem toplamı — payroll girdisi) query'leri. Authz EmployeePolicy (check-in/out + liste = access, manuel düzeltme + özet = manage). Kart okuyucu/PDKS entegrasyonu **kasıtlı olarak eklenmedi** — ileride aynı check-in/check-out komutları farklı bir aktörden (webhook) tetiklenerek bağlanabilir; ayrı bir port/adapter olmadan. Şema `hr.prisma`. Migration uygulandı (2026-07-21, `20260721195008_vh`).
- **6.3 Bordro** ✅ — `finance/payroll` (SGK matrahı, brüt→net).

### GRUP 7 — Üretim 🔴 (iş emri / dental lab / MRP)
### GRUP 8 — Proje Yönetimi 🔴

### GRUP 9 — Sağlık Entegrasyonları 🟡
- **9.1 E-nabız** 🟡 — `enabiz.prisma` schema var, **modül/implementasyon 🔴** (Sağlık Bakanlığı API gerektirir).
- **9.2 E-reçete** 🔴 (MEDULA gerektirir).
- **9.3 E-rapor** 🔴 (DICOM/lab).
- **9.4 Onam Formu — Nitelikli E-İmza Entegratörü** 🔴 — 1.3'teki tablet-imza akışını hukuken bağlayıcı nitelikli e-imza/mobil imzaya taşıyacak dış entegratör (5070 sayılı kanun kapsamı). **Çok sonraki iş** — dış kimlik/sözleşme gerektirir, kullanıcı tarafından ertelendi (2026-07-22).

## Önerilen Sıra (dış-kimlik gerektirmeyen, şimdi kodlanabilir olanlar önce)
> Tamamlandı: ✅ HR (6.1 tam + 6.2 + attendance), ✅ Onam Formu (1.3), ✅ Ajans ROI (3.2), ✅ Satın alma (5.1), ✅ Raporlama/P&L (4.3), ✅ Kasa + kasa→muhasebe köprüsü + Banka + ekstre mutabakatı (4.1 — Grup 4 finans tamam). **Grup 6 İK artık tamamen bitti.** Son güncelleme: 2026-07-22.

1. Opsiyonel: **Banka oto-eşleştirme** (4.1) — ekstre satırı ↔ 102 defteri amount+tarih otomatik eşleştirme (manuel taban hazır). **← sıradaki**
2. Opsiyonel: **P&L dönem karşılaştırması** (4.3) — mevcut `income-statement`'a önceki-dönem kıyas + delta (Ajans ROI deseni).
3. **Üretim** (Grup 7) / **Proje yönetimi** (Grup 8) — yeni büyük modüller.
4. Dış-kimlik gerektirenler (E-Fatura gerçek adapter, E-nabız/E-reçete, Messenger, **Onam formu nitelikli e-imza**) — kimlik/erişim geldiğinde.
