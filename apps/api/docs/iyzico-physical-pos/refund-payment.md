# iyzico Terminal API - Refund Payment (VUK 509)

Bu servis, daha önce başarılı olmuş bir fiziksel POS ödemesine tam veya kısmi iade işlemi uygular.

Sistem:
- iyzico Terminal API
- VUK 509
- Fiziksel POS entegrasyonu

Önemli:
Bu API klasik sanal POS refund API'si değildir.
Refund işlemi gerçek POS terminaline gider.
Kartın tekrar POS cihazında okutulması gerekebilir.

---

# Endpoint

POST /v2/terminal-host/payment/refund

Sandbox:
https://sandbox-api.iyzipay.com/v2/terminal-host/payment/refund

Production:
https://api.iyzipay.com/v2/terminal-host/payment/refund

---

# Authentication

OAuth2 Bearer Token kullanılır.

Header:

Authorization: Bearer {access_token}

Content-Type: application/json

access_token daha önce login + authorize flow sonrası alınmalıdır.

---

# Refund İş Akışı

1. Kullanıcı daha önce ödeme yapmıştır
2. paymentId saklanmıştır
3. Kullanıcı iade ister
4. CRM refund endpointini çağırır
5. iyzico isteği fiziksel POS cihazına yönlendirir
6. POS cihazı refund akışını başlatır
7. Kart okutulur / işlem onaylanır
8. Refund sonucu API response olarak döner

---

# Request Body

## conversationId
type: string
required: true

Request-response eşleşmesi için kullanılır.
Merchant tarafından üretilir.

Örnek:
"conversation-refund-001"

---

## locale
type: enum
required: true

Desteklenen değerler:
- tr
- en

Örnek:
"tr"

---

## paymentId
type: string
required: true

İade yapılacak orijinal ödeme ID'si.

Bu değer:
- complete payment response'undan gelir
- DB'de saklanmalıdır

Örnek:
"11001100"

---

## deviceUniqueId
type: string
required: true

Refund işlemini gerçekleştirecek fiziksel POS cihazının unique ID'si.

Bu:
- gerçek cihaz ID'sidir
- iyzico sisteminde kayıtlı olmalıdır
- random string olamaz

Örnek:
"PAV860047264"

---

## price
type: number
required: true

İade tutarı.

Kurallar:
- Orijinal ödeme tutarından büyük olamaz
- Kısmi refund desteklenir
- Decimal olabilir

Örnek:
50
100.50

---

## transactionReferenceId
type: string
required: true

Refund işlemine ait merchant-side unique transaction ID.

Her refund işleminde yeni üretilmelidir.

Tekrarlanmamalıdır.

Örnek:
"refund-20260524-0001"

Öneri:
UUID kullanılmalı.

---

## paymentDate
type: string (YYYYMMDD)
required: true

Orijinal işlemin muhasebeleştiği tarih.

Örnek:
"20260101"

Format:
YYYYMMDD

---

## reason
type: string
required: false

Refund nedeni.

Örnek:
"patient_cancelled"
"wrong_amount"

---

## description
type: string
required: false

Refund açıklaması.

Örnek:
"Patient cancelled treatment"

---

# Örnek Request

```json
{
  "conversationId": "conversation4",
  "locale": "tr",
  "paymentId": "11001100",
  "deviceUniqueId": "PAV860047264",
  "price": 50,
  "transactionReferenceId": "refundtransaction2",
  "paymentDate": "20260101",
  "reason": "patient_cancelled",
  "description": "Patient cancelled treatment"
}