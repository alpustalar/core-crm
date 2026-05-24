# iyzico Terminal API - End of Day (EOD / Gün Sonu)

Bu servis, fiziksel POS terminali için **gün sonu kapama işlemi (EOD)** çalıştırır ve o güne ait toplam işlem özetini döner.

Sistem:
- iyzico Terminal API
- VUK 509
- Fiziksel POS

---

# Endpoint

POST /v2/terminal-host/eod

Sandbox:
https://sandbox-api.iyzipay.com/v2/terminal-host/eod

Production:
https://api.iyzipay.com/v2/terminal-host/eod

---

# Authentication

OAuth2 Bearer Token zorunludur.

Header:

Authorization: Bearer {access_token}
Content-Type: application/json

access_token:
- login + authorize flow sonrası alınır
- sürelidir
- refresh edilebilir

---

# EOD Nedir?

EOD (End of Day) işlemi:

- Gün içerisindeki tüm POS işlemlerini kapatır
- Banka settlement (batch closing) işlemini tetikler
- Günlük toplamları üretir
- Batch numarası oluşturur

---

# İş Mantığı

EOD çağrıldığında:

1. Terminal üzerindeki açık batch kontrol edilir
2. Gün içi tüm işlemler toplanır
3. Banka tarafına settlement gönderilir
4. Batch kapatılır
5. Özet rapor döner

---

# Request Body

## conversationId
type: string
required: true

İstek/response eşleştirme ID’si.

Örnek:
"eod-20260524-001"

---

## locale
type: string
required: true

Desteklenen:
- tr
- en

---

## deviceUniqueId
type: string
required: true

Gün sonu yapılacak POS cihazının ID’si.

Örnek:
"PAV860047262"

Kurallar:
- sistemde kayıtlı olmalı
- merchant terminaline bağlı olmalı

---

## useSummary
type: boolean
optional: true

true:
- slip / response içinde detaylı işlem özeti döner

false:
- minimum bilgi döner

---

# Örnek Request

```json
{
  "conversationId": "conversation5",
  "locale": "TR",
  "deviceUniqueId": "PAV860047262",
  "useSummary": true
}