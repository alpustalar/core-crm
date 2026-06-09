# PAX Terminalleri ile Ödeme Entegrasyonu — TypeScript Rehberi (POSLink)

> **Amaç:** Fiziksel bir PAX POS cihazına (kredi/banka kartı okuyan terminal) TypeScript/Node.js
> uygulamandan ödeme komutu gönderip yanıtı okumak. Bu doküman PAX'in **POSLink (Semi-Integrated)**
> protokolünü anlaşılır bir dille anlatır ve çalışan TypeScript örnekleri verir.

---

## 0. Önce kısa bir özet (TL;DR)

- PAX terminali bir **sunucu** gibi davranır, senin uygulaman (POS / yazıcı kasası = **ECR**) **istemci**dir.
- Uygulaman terminale **TCP/IP** (aynı ağda, IP + port) veya **RS232 seri / USB** üzerinden bağlanır.
- Haberleşme, baytlardan oluşan bir **paket protokolü** ile yapılır: her mesaj `STX ... ETX LRC`
  çerçevesi içinde gider.
- Sen "**şu tutarı sat**" komutunu gönderirsin → terminal müşteriden kartı okur, PIN ister, bankaya
  gider, sonucu sana döndürür.
- **Kart verisi senin uygulamandan geçmez.** Kartı terminal okur ve şifreli işler — bu PCI uyumu
  açısından kritiktir. Sen sadece tutar gönderir, onay/ret sonucunu alırsın.
- PAX'in resmî SDK'ları **.NET** ve **Android/Java** içindir; **resmî TypeScript SDK'sı yoktur.**
  TypeScript için ya topluluk paketleri kullanılır ya da protokol doğrudan `net` (TCP) / `serialport`
  (seri) ile uygulanır. Bu doküman ikincisini (en sağlam yolu) gösterir.

---

## 1. Kavramlar ve mimari

| Terim | Anlamı |
|-------|--------|
| **ECR** | *Electronic Cash Register* — senin POS/kasa yazılımın. POSLink'te **istemci** taraf. |
| **Terminal / PED** | Fiziksel PAX cihazı (A920, A80, A35, S300, vb.). Kartı okuyan donanım. |
| **BroadPOS** | PAX'in terminal üstünde çalışan ödeme uygulaması. POSLink komutlarını dinler ve bankaya gider. |
| **Semi-Integrated** | "Yarı entegre" model: kart verisi terminalde kalır, senin yazılımın yalnızca tutar/komut gönderir. PCI kapsamını küçültür. |
| **POSLink** | ECR ↔ Terminal arasındaki haberleşme protokolü/SDK ailesinin adı. |
| **PAXSTORE** | Terminal/uygulama yönetim portalı (ayrı bir konu — bu dokümanın kapsamı değil). |

### İki entegrasyon modelini karıştırma

1. **Semi-Integrated (POSLink)** — *bu dokümanın konusu.* Senin yazılımın ayrı bir makinede (PC/sunucu)
   çalışır, terminale ağ/seri üzerinden komut yollar. TypeScript için uygun olan budur.
2. **On-device (Neptune/Android SDK)** — Uygulama doğrudan terminalin Android'i üzerinde çalışır.
   Java/Kotlin gerektirir, TypeScript ile yapılmaz.

---

## 2. Fiziksel bağlantı seçenekleri

| Yöntem | Ne zaman | TypeScript tarafı |
|--------|----------|-------------------|
| **TCP/IP (Ethernet/Wi-Fi)** | Terminal ile sunucu aynı yerel ağda. En yaygın. | Node `net.Socket` |
| **RS232 Seri** | Terminal kabloyla doğrudan PC'ye bağlı | `serialport` npm paketi |
| **USB (sanal seri port)** | USB ile bağlı terminaller | `serialport` (CDC/ACM portu) |

### Terminali TCP/IP moduna alma (PAX S300 örneği)

1. Klavyede **F + 1** → ana menü → **Communication**.
2. **LAN Parameter** → **IP Address** (terminalin IP'sini not al).
3. **Communication → ECR Com Type → Ethernet** → port numarasını gör.
4. Haberleşme tipini **TCP/IP** seç.

> Cihaz modeline göre menü adımları değişebilir (A-serisi Android terminallerde BroadPOS uygulamasının
> ayarlarından yapılır). Terminalin IP'si ve portu, kodda bağlanacağın adrestir.

---

## 3. Protokol: bir paket neye benzer?

POSLink ham protokolü, ASCII kontrol karakterleriyle çerçevelenmiş baytlardan oluşur. Temel iskelet:

```
[STX] <gövde> [ETX] [LRC]
```

| Bayt | Hex | Görevi |
|------|-----|--------|
| **STX** | `0x02` | Mesaj başlangıcı (*Start of Text*) |
| **ETX** | `0x03` | Mesaj sonu (*End of Text*) |
| **LRC** | hesaplanır | Bütünlük kontrolü (*Longitudinal Redundancy Check*) |
| **FS** | `0x1C` | Alanları (field) ayırır |
| **US** | `0x1F` | Bir alanın alt-parçalarını ayırır (ör. tutar grubu) |

### Gövdenin yapısı

Gövde, **komut kodu** ile başlar, ardından **protokol sürümü** ve komuta özgü **alanlar** FS ile ayrılmış
şekilde dizilir:

```
KOMUT [FS] SURUM [FS] alan1 [FS] alan2 [FS] ...
```

Bir alan kendi içinde birden çok değer taşıyorsa (örneğin tutar bilgisi: işlem tutarı, bahşiş, nakit
avans...), bu alt-değerler **US (0x1F)** ile ayrılır.

### LRC nasıl hesaplanır?

LRC, `STX`'ten **sonraki** tüm baytların ve `ETX`'in birbiriyle **XOR**'lanmasıdır:

```
LRC = gövde[0] XOR gövde[1] XOR ... XOR gövde[n] XOR ETX
```

Yani: STX hariç, ETX dahil, aradaki her baytı XOR'la. Terminal aynı hesabı yapıp gönderdiğin LRC ile
karşılaştırır; tutmazsa paketi reddeder (NAK).

### El sıkışma (ACK/NAK)

- **ACK** (`0x06`): "paketi sağlam aldım".
- **NAK** (`0x15`): "bozuk geldi, tekrar gönder".
- **EOT** (`0x04`): oturum/iletim sonu.

Tipik akış: ECR paketi yollar → terminal `ACK` → terminal işi yapar → terminal yanıt paketini yollar →
ECR `ACK`.

---

## 4. Komut grupları (ana hatlar)

POSLink komutları gruplara ayrılır. En çok kullanılanlar:

| Grup | Örnek komut | İş |
|------|-------------|-----|
| **Manage (Yönetim)** | `Initialize` | Terminalle bağlantıyı/oturumu başlat, sürüm/sağlık kontrolü |
| | `GetSignature` | Ekrandan imza al |
| | `Reset` / `ShowMessage` | Terminali sıfırla / ekrana mesaj yaz |
| **Transaction (İşlem)** | `DoCredit` | **Kredi kartı işlemleri** (satış, iade, iptal, ön provizyon...) |
| | `DoDebit` | Banka kartı (PIN'li) işlemleri |
| | `DoBatch` | Gün sonu / batch kapama (settlement) |
| **Report** | `GetHistory` / `DetailReport` | İşlem raporları |

> **Önemli:** Komutların tam ASCII kodları, alan sıraları ve sürüm değerleri **POSLink sürümüne göre
> değişir**. Bu doküman protokolün *mantığını* ve TypeScript'te *nasıl uygulanacağını* öğretir; alanların
> kesin sırasını üretime almadan önce resmî **"POSLink Programmer's Guide"** belgesinden (PAX Developer
> Center) doğrulamalısın. Kesin sıra yanlışsa terminal paketi reddeder.

### Bir kredi kartı satışında (DoCredit / SALE) tipik istek alanları

| Alan | Açıklama |
|------|----------|
| **TransType** | İşlem tipi (SALE, RETURN, VOID, AUTH, PREAUTH...) |
| **Amount** | Tutar — **kuruş/cent cinsinden, ondalıksız tam sayı** (ör. 12.50 → `1250`) |
| **TipAmount / CashBack** | Bahşiş / nakit avans (opsiyonel) |
| **ECRRefNum** | Senin tarafında ürettiğin benzersiz işlem referansı (yanıtı eşleştirmek için) |
| **InvoiceNumber** | Fatura/fiş numarası (opsiyonel) |
| **ReportStatus / Extra** | Ek bayraklar |

### Tipik yanıt alanları (PaymentResponse)

| Alan | Açıklama |
|------|----------|
| **ResultCode / ResponseCode** | İşlemin sonucu. `000000` genelde **başarı** demektir. |
| **ResultText / HostResponse** | Açıklama metni ("APPROVAL", "DECLINE"...) |
| **ApprovalCode (AuthCode)** | Banka onay kodu |
| **MaskedPAN** | Maskeli kart no (ör. `************1234`) |
| **CardType / EntryMode** | Kart şeması (VISA...) ve okuma şekli (chip/temassız/manyetik) |
| **Amount** | Onaylanan tutar |
| **RefNum / HostReference** | Banka/host referansı (iptal için lazım olur) |

---

## 5. Örnek TransType ve ResponseCode değerleri

> Aşağıdaki değerler **örnek/temsilîdir**. Gerçek değerleri kendi processor + POSLink sürümünün
> kılavuzundan teyit et.

**Kredi (DoCredit) işlem tipleri (örnek):**

| Değer | İşlem |
|-------|-------|
| `01` | AUTH (yalnızca provizyon/doğrulama) |
| `02` | SALE (satış — kart çekme) |
| `03` | RETURN (iade) |
| `04` | VOID (işlem iptali) |
| `06` | PREAUTH (ön provizyon) |
| `16` | POSTAUTH / COMPLETION (ön provizyonu tamamlama) |
| `18` | FORCEAUTH (telefon onayıyla zorlamalı satış) |

**Yanıt kodu mantığı:**

- `000000` → işlem **onaylandı**.
- `000000` dışındaki kodlar → ret/hata. `ResultText` alanı sebebi açıklar
  (ör. timeout, kart reddedildi, iletişim hatası).

---

## 6. TypeScript ile uygulama

Aşağıda protokolü sıfırdan uygulayan, bağımlılıksız (sadece Node yerleşik `net` modülü) bir örnek var.
Bu kod **protokol çerçevelemesini** (STX/ETX/LRC, FS/US, ACK/NAK) doğru gösterir. Alanların kesin
sırasını resmî kılavuza göre `buildSaleBody()` içinde ayarlarsın.

### 6.1 Sabitler ve LRC

```typescript
// pax-protocol.ts
export const CTRL = {
  STX: 0x02,
  ETX: 0x03,
  ACK: 0x06,
  NAK: 0x15,
  EOT: 0x04,
  FS: 0x1c, // alan ayırıcı  (Field Separator)
  US: 0x1f, // alt-alan ayırıcı (Unit Separator)
} as const;

/**
 * LRC = STX'ten sonraki tüm baytlar XOR ETX.
 * body: STX ve ETX hariç gövde baytları.
 */
export function calcLRC(body: Buffer): number {
  let lrc = 0;
  for (const b of body) lrc ^= b;
  lrc ^= CTRL.ETX; // ETX de hesaba dahil
  return lrc;
}

/**
 * Gövdeyi tam pakete çevirir:  [STX] body [ETX] [LRC]
 */
export function frame(body: Buffer): Buffer {
  const lrc = calcLRC(body);
  return Buffer.concat([
    Buffer.from([CTRL.STX]),
    body,
    Buffer.from([CTRL.ETX, lrc]),
  ]);
}
```

### 6.2 Alanları birleştirme yardımcıları

```typescript
// pax-fields.ts
import { CTRL } from "./pax-protocol";

const FS = Buffer.from([CTRL.FS]);
const US = Buffer.from([CTRL.US]);

/** FS ile ayrılmış gövde üretir: KOMUT [FS] alan1 [FS] alan2 ... */
export function joinFields(parts: (string | Buffer)[]): Buffer {
  const bufs = parts.map((p) => (typeof p === "string" ? Buffer.from(p, "ascii") : p));
  const out: Buffer[] = [];
  bufs.forEach((b, i) => {
    if (i > 0) out.push(FS);
    out.push(b);
  });
  return Buffer.concat(out);
}

/** Bir alanın alt-parçalarını US ile birleştirir (ör. tutar grubu). */
export function joinSub(parts: string[]): Buffer {
  const out: Buffer[] = [];
  parts.forEach((p, i) => {
    if (i > 0) out.push(US);
    out.push(Buffer.from(p, "ascii"));
  });
  return Buffer.concat(out);
}
```

### 6.3 TCP bağlantısı ve gönder/al döngüsü

```typescript
// pax-client.ts
import net from "node:net";
import { CTRL, frame } from "./pax-protocol";

export interface PaxClientOptions {
  host: string;        // terminal IP'si, ör. "192.168.1.50"
  port: number;        // ECR portu, ör. 10009
  timeoutMs?: number;  // yanıt bekleme süresi
}

export class PaxClient {
  constructor(private opts: PaxClientOptions) {}

  /**
   * Bir gövde gönderir, terminalin yanıt paketini (STX..ETX LRC) ham olarak döndürür.
   * ACK/NAK el sıkışmasını da yönetir.
   */
  send(body: Buffer): Promise<Buffer> {
    const { host, port, timeoutMs = 120_000 } = this.opts; // ödeme için uzun timeout
    const packet = frame(body);

    return new Promise<Buffer>((resolve, reject) => {
      const socket = net.createConnection({ host, port });
      const chunks: Buffer[] = [];
      let gotAck = false;

      const timer = setTimeout(() => {
        socket.destroy();
        reject(new Error("PAX: yanıt zaman aşımına uğradı"));
      }, timeoutMs);

      socket.on("connect", () => socket.write(packet));

      socket.on("data", (data) => {
        // İlk bayt ACK/NAK olabilir
        if (!gotAck) {
          if (data[0] === CTRL.ACK) {
            gotAck = true;
            data = data.subarray(1); // kalanı (varsa) yanıt paketidir
          } else if (data[0] === CTRL.NAK) {
            clearTimeout(timer);
            socket.destroy();
            return reject(new Error("PAX: NAK — paket terminalce reddedildi"));
          }
        }
        if (data.length) chunks.push(data);

        // ETX gördüysek paket tamamdır (ETX'ten sonra 1 bayt LRC gelir)
        const buf = Buffer.concat(chunks);
        const etxIdx = buf.indexOf(CTRL.ETX);
        if (etxIdx !== -1 && buf.length >= etxIdx + 2) {
          clearTimeout(timer);
          socket.write(Buffer.from([CTRL.ACK])); // yanıtı aldığımızı bildir
          socket.end();
          resolve(buf.subarray(0, etxIdx + 2));
        }
      });

      socket.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
}
```

### 6.4 Yanıt paketini doğrulama ve ayrıştırma

```typescript
// pax-parse.ts
import { CTRL, calcLRC } from "./pax-protocol";

export interface PaxResponse {
  command: string;
  fields: string[];      // FS ile bölünmüş ham alanlar
  raw: Buffer;
}

/** [STX] body [ETX] [LRC] paketini doğrular ve alanlara böler. */
export function parsePacket(packet: Buffer): PaxResponse {
  if (packet[0] !== CTRL.STX) throw new Error("PAX: STX yok");
  const etxIdx = packet.indexOf(CTRL.ETX);
  if (etxIdx === -1) throw new Error("PAX: ETX yok");

  const body = packet.subarray(1, etxIdx);
  const lrc = packet[etxIdx + 1];
  if (calcLRC(body) !== lrc) throw new Error("PAX: LRC uyuşmuyor (bozuk paket)");

  const parts = splitBuffer(body, CTRL.FS).map((b) => b.toString("ascii"));
  return { command: parts[0] ?? "", fields: parts, raw: packet };
}

function splitBuffer(buf: Buffer, sep: number): Buffer[] {
  const out: Buffer[] = [];
  let start = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === sep) {
      out.push(buf.subarray(start, i));
      start = i + 1;
    }
  }
  out.push(buf.subarray(start));
  return out;
}
```

### 6.5 Yüksek seviye: Initialize + Satış

```typescript
// pax-payment.ts
import { PaxClient } from "./pax-client";
import { joinFields, joinSub } from "./pax-fields";
import { parsePacket, PaxResponse } from "./pax-parse";

const PROTOCOL_VERSION = "1.28"; // kullandığın POSLink sürümüne göre

export class PaxPayment {
  private client: PaxClient;
  constructor(host: string, port: number) {
    this.client = new PaxClient({ host, port });
  }

  /** Terminalle bağlantıyı/oturumu başlatır (sağlık kontrolü). */
  async initialize(): Promise<PaxResponse> {
    // NOT: "A00" komut kodu ve alan sırası örnektir; resmî kılavuzla teyit et.
    const body = joinFields(["A00", PROTOCOL_VERSION]);
    const resp = await this.client.send(body);
    return parsePacket(resp);
  }

  /**
   * Kredi kartı satışı.
   * @param amountMinor  Tutar — KURUŞ cinsinden tam sayı (12.50 TL -> 1250)
   * @param ecrRefNum    Senin ürettiğin benzersiz referans
   */
  async sale(amountMinor: number, ecrRefNum: string): Promise<SaleResult> {
    const body = this.buildSaleBody(amountMinor, ecrRefNum);
    const resp = await this.client.send(body);
    const parsed = parsePacket(resp);
    return this.interpretSale(parsed);
  }

  /** Satış gövdesini kurar. Alan sırası POSLink kılavuzuna göre ayarlanır. */
  private buildSaleBody(amountMinor: number, ecrRefNum: string): Buffer {
    const TRANS_TYPE_SALE = "01"; // DoCredit içinde SALE; gerçek değeri teyit et
    // Tutar grubu: [TransactionAmount, TipAmount, CashBackAmount, ...] US ile ayrılır
    const amountGroup = joinSub([String(amountMinor)]);
    // Trace grubu: [ReferenceNumber, InvoiceNumber, ...]
    const traceGroup = joinSub([ecrRefNum]);

    // KOMUT, SURUM, TransType, AmountGroup, TraceGroup ...
    return joinFields(["T00", PROTOCOL_VERSION, TRANS_TYPE_SALE, amountGroup, traceGroup]);
  }

  /** Ham yanıtı anlamlı sonuca çevirir. */
  private interpretSale(p: PaxResponse): SaleResult {
    // Alan indeksleri örnektir — gerçek konumları kılavuzdan eşleştir.
    const responseCode = p.fields[2] ?? "";
    const responseText = p.fields[3] ?? "";
    const approved = responseCode === "000000";
    return {
      approved,
      responseCode,
      responseText,
      raw: p.fields,
    };
  }
}

export interface SaleResult {
  approved: boolean;
  responseCode: string;
  responseText: string;
  raw: string[];
}
```

### 6.6 Kullanım

```typescript
// index.ts
import { PaxPayment } from "./pax-payment";

async function main() {
  const pax = new PaxPayment("192.168.1.50", 10009);

  // 1) Bağlantıyı doğrula
  const init = await pax.initialize();
  console.log("Terminal hazır:", init.command);

  // 2) 12,50 TL satış (kuruş cinsinden 1250)
  const result = await pax.sale(1250, `REF-${Date.now()}`);

  if (result.approved) {
    console.log("✅ Onaylandı:", result.responseText);
  } else {
    console.log("❌ Reddedildi:", result.responseCode, result.responseText);
  }
}

main().catch((e) => console.error("Hata:", e));
```

### Seri port (RS232/USB) kullanırsan

`net.createConnection` yerine [`serialport`](https://serialport.io/) paketini kullanırsın; gönderdiğin
paket (STX..ETX LRC) ve ACK/NAK mantığı **aynı** kalır:

```typescript
import { SerialPort } from "serialport";
const port = new SerialPort({ path: "/dev/ttyUSB0", baudRate: 9600 });
port.write(packet);           // frame(body)
port.on("data", (chunk) => { /* aynı ACK/ETX/LRC mantığı */ });
```

---

## 7. Hazır npm paketleri (alternatif)

Protokolü kendin yazmak istemezsen topluluk paketleri var. Bunlar **resmî PAX ürünü değildir**;
üretime almadan önce bakım durumunu, lisansını ve kendi terminal/processor'ünle uyumunu test et:

- `poslink-pax-sdk` — POSLink için JavaScript SDK.
- `react-native-pax-poslink` — React Native uygulamalarında PAX entegrasyonu.

Resmî, desteklenen SDK'lar yalnızca **.NET** ve **Android/Java** içindir. Node tarafında bunları
sarmalamak (örn. .NET SDK'yı bir mikro-servis olarak çalıştırıp TypeScript'ten HTTP ile çağırmak) bazı
ekiplerin tercih ettiği bir yoldur.

---

## 8. Resmî dokümana erişim

POSLink'in tam ve güncel teknik dokümanları (komut kodları, tüm alan listeleri, sürüm farkları) halka
açık değildir; **PAX Developer Center** üzerinden erişim talep edilir:

- PAX Developer Center / PAXSTORE (US): <https://www.paxstore.us>
- İhtiyacın olan ana belgeler:
  - **POSLink Programmer's Guide** (SDK kullanım kılavuzu)
  - **"Interface Specification Between ECR/PC and Terminal"** (ham protokol, düşük seviye baytlar)
- Türkiye'de cihazını aldığın **banka / ödeme kuruluşu (processor)** çoğu zaman kendi entegrasyon
  dokümanını ve test terminalini verir. Komut kümesi processor'e göre kısıtlanmış olabilir; bu yüzden
  **önce onların dokümanını** iste.

---

## 9. Güvenlik ve PCI notları

- **Kart verisine asla dokunma.** Semi-integrated modelin tüm amacı, PAN/CVV/PIN gibi hassas verilerin
  terminalde kalmasıdır. Senin yazılımın yalnızca tutar + referans gönderir, onay sonucu alır.
- Kart numarasını, manyetik şerit verisini, CVV'yi **loglama, saklama, ekrana basma.** Yanıt zaten
  maskeli PAN döndürür.
- İptal/iade için kart numarası değil, terminalin döndürdüğü **referans/host reference** kullanılır.
- TCP kullanıyorsan terminal ile sunucuyu **aynı güvenli yerel ağda/VLAN'da** tut; bu trafiği internete
  açma.
- Gün sonu (**batch/settlement**) kapamayı unutma — bu işlemler `DoBatch` ile yapılır.

---

## 10. Sık karşılaşılan sorunlar

| Belirti | Olası sebep |
|--------|-------------|
| Bağlanamıyor (timeout) | Terminal TCP/IP modunda değil, yanlış IP/port, farklı ağ/VLAN |
| Sürekli **NAK** | LRC yanlış hesaplanıyor ya da gövde baytları bozuk |
| Paket çözülmüyor | ETX'ten sonraki LRC baytını okumayı atlamak; veriyi parça parça (chunk) toplamamak |
| "Reddedildi" ama sebep belirsiz | `ResultText`/host yanıt alanını oku; processor'e özgü kod olabilir |
| Alanlar yanlış yere oturuyor | POSLink **sürümü** veya **alan sırası** kılavuzdakiyle uyuşmuyor |

---

## Kaynaklar

- [PAX Payment Processing Terminal SDK / API Integration — IntegratePayments](https://www.integratepayments.com/payment-gateway/pax-payment-machine-api-sdk-integration)
- [PAX SI SDK (Semi-Integrated) — North Developer](https://developer.paymentshub.com/products/card-present/si-sdks/pax-si-sdk)
- [Setting up PAX POSLink Integration (TCP/IP, IP & port) — WooPOS](https://support.woopos.com/knowledge-base/setting-up-pax-poslink-integration/)
- [PAX POSLINK Documentation — BridgePay Developer Center](https://bridgepaynetwork.atlassian.net/wiki/spaces/DC/pages/225312882/PAX+POSLINK+Documentation)
- [PAXSTORE Developer Guide (PDF) — PAX](https://faqs.pax.us/wp-content/uploads/2020/05/PAXSTORE-Developer-Guide-V1.08-02-04-2020-1.pdf)
- [PAX Technology GitHub (POSLink-UI vb.)](https://github.com/PAXTechnologyInc)
- [Pax POSLink for Semi-Integrated processing — Duplicate Transaction](https://www.duplicatetransaction.com/pax-poslink-for-semi-integrated-processing/)
- npm: `poslink-pax-sdk`, `react-native-pax-poslink`

---

> **Not:** Bu doküman POSLink protokolünün *mantığını* ve TypeScript'te nasıl uygulanacağını açıklamak
> için hazırlanmıştır. Komut kodları, alan sıraları ve TransType/ResponseCode değerleri POSLink sürümüne
> ve ödeme kuruluşuna göre değişebileceğinden, üretime almadan önce resmî **POSLink Programmer's Guide**
> ile birebir doğrulanmalıdır.
