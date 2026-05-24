Aşağıda iyzico **Terminal API (VUK 509) Hata Kodları**nı temiz, geliştirici dokümantasyonuna uygun ve service içinde direkt kullanılabilir formatta düzenledim.

---

# iyzico Terminal API - Hata Kodları

## Genel Hata Grupları

Bu API’de tüm hatalar şu kategorilere ayrılır:

### 1. TIMEOUT_ERROR

Cihazdan cevap gelmezse oluşur.

* **Kod:** 380103
* **Mesaj:**

  * EN: `Timeout occurred while waiting for device response!`
  * TR: `Cihaz yanıtı beklenirken zaman aşımı oluştu!`

---

### 2. SYSTEM_ERROR

Sistem veya token problemi.

* Token hataları
* Beklenmeyen sistem hataları
* Yetkisiz erişim

**Kodlar:**

* 100310 → Invalid token
* 100311 → Access token expired
* 380102 → Auth device erişim yok

---

### 3. BANK_ERROR

Bankadan başarısız cevap gelirse.

* authCode != 00

📌 Not:
Mesaj direkt bankadan gelir (dinamik).

---

### 4. DEVICE_ERROR

POS cihazı kaynaklı hatalar.

**Kodlar:**

* 380201 → Terminal busy

  * Terminal başka işlem yapıyor

* 380202 → Techpos start error

  * Uygulama başlatılamadı

* 380203 → Null response

  * Cihaz boş cevap döndü

* 380204 → Refresh token session error

  * Session sonlandı

* 380205 → Response creation error

  * Cihaz response üretemedi

---

### 5. PAYMENT_ERROR

iyzico payment servis kaynaklı hata.

📌 Mesajlar sistemden direkt gelir.

---

### 6. BUSINESS_ERROR

İş kuralı hataları (domain logic)

**Kodlar:**

* 380101 → Auth device not found

  * username: {0}

* 380107 → Payment not found (paymentId)

  * paymentId: {0}

* 380108 → Payment not found (id)

  * id: {0}

* 380109 → Payment not found (orderId)

  * orderId: {0}

* 380112 → Insufficient balance for refund/void

  * Hesapta yeterli tutar yok

---

### 7. VALIDATION_ERROR

Request hatalı gönderildiğinde oluşur.

**Kodlar:**

* 380104 → Request validation error

  * Details: {0}

* 380105 → Operation not supported for device model

  * İşlem cihaz modelinde desteklenmiyor

* 380111 → Missing required identifiers

  * transactionReferenceId veya paymentId zorunlu

---

# Service Kullanımı İçin Önerilen Mapping

## Domain Error Type

```ts
type TerminalError =
  | 'TIMEOUT_ERROR'
  | 'SYSTEM_ERROR'
  | 'BANK_ERROR'
  | 'DEVICE_ERROR'
  | 'PAYMENT_ERROR'
  | 'BUSINESS_ERROR'
  | 'VALIDATION_ERROR'
```

---

## Retry Strategy

### RETRY EDİLEBİLİR

* TIMEOUT_ERROR
* DEVICE_ERROR (bazı kodlar)
* SYSTEM_ERROR (token hariç)

### RETRY EDİLEMEZ

* VALIDATION_ERROR
* BUSINESS_ERROR
* BANK_ERROR
* PAYMENT_ERROR

---

## Kritik Business Notlar

### 1. 380111 (validation)

👉 request bozuk → direkt fail

---

### 2. 380112 (refund/void balance)

👉 kullanıcıya “yetersiz bakiye” dönüşü

---

### 3. 100311 (token expired)

👉 refresh token flow tetiklenmeli

---

### 4. 380201 (terminal busy)

👉 queue mantığı önerilir

---

# Önerilen Error Wrapper (Service Layer)

```ts
class TerminalApiError extends Error {
  constructor(
    public code: string,
    public group: TerminalError,
    public message: string,
    public raw?: any
  ) {
    super(message)
  }
}
```

---

# Önerilen Handling Flow

```text
API response gelir
  ↓
errorGroup kontrol edilir
  ↓
mapping yapılır
  ↓
retry / fail / refresh token kararı verilir
```

---

# Ürün Açısından Kritik Insight

Bu hata sistemi aslında şunu gösteriyor:

👉 Bu API “fintech + hardware orchestration” sistemi

Yani:

* sadece API değil
* POS cihaz state management var
* session + device lock var
* bank integration var

---