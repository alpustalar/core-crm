Void Payment


Bu servis, uygun durumdaki bir ödemeyi iptal eder. Örnek: "paymentId ve paymentDate ile iptal işlemi başlatılır. Kart pos cihazı üzerinde okutularak iptal işlemi tamamlanır.”

Body

Zorunlu alanlar: 

conversationId
string
İstek ve yanıt eşleşmesi yapılacak ID değeri. Üye işyeri tarafından belirlenir, istekte gönderilen bilgi yanıtta geri döner.
locale
string · enum
Yanıt dili.
Possible values: “tr” “en”
paymentId
string
İptal Edilecek Ödeme Numarası
paymentDate
string
İşlemin muhasebeleştirildiği tarih (YYYYMMDD).
deviceUniqueId
string
İşlemin gerçekleştirildiği terminal / cihaz için tanımlı benzersiz kimlik bilgisi.
transactionReferenceId
string
İptal işlemine ait üretilen benzersiz bir referans numarası


Opsiyonel alanlar:

reason
string
İptal nedeni
description
string
İptal açıklaması


Örnek istek

const response = await fetch('https://api.iyzipay.com/v2/terminal-host/payment/void', {
    method: 'POST',
    headers: {
      "Authorization": "Bearer YOUR_SECRET_TOKEN",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "conversationId": "conversation3",
      "locale": "TR",
      "paymentId": "28251028",
      "paymentDate": "20260112",
      "deviceUniqueId": "PAV860047264",
      "transactionReferenceId": "voidtransaction1",
      "reason": "",
      "description": ""
    })
});

const data = await response.json();



Örnek repsonse

200 succes
{
  "conversationId": "conversation3",
  "locale": "tr",
  "deviceUniqueId": "PAV860047264",
  "transactionReferenceId": "voidtransaction1",
  "status": "SUCCESS",
  "errorCode": "",
  "errorMessage": "",
  "errorGroup": "",
  "systemTime": 1768217880000,
  "paymentId": "28251028",
  "paymentDate": "20260112",
  "price": 50,
  "currency": "TRY",
  "authCode": "552238",
  "hostReference": "HSTREF0000000001",
  "cancelHostReference": "HSTREF0000000002"
}

422 error
{
  "conversationId": "conversation3",
  "locale": "tr",
  "deviceUniqueId": "PAV860047264",
  "transactionReferenceId": "voidtransaction1",
  "status": "SUCCESS",
  "errorCode": "",
  "errorMessage": "",
  "errorGroup": "",
  "systemTime": 1768217880000,
  "paymentId": "28251028",
  "paymentDate": "20260112",
  "price": 50,
  "currency": "TRY",
  "authCode": "552238",
  "hostReference": "HSTREF0000000001",
  "cancelHostReference": "HSTREF0000000002"
}
