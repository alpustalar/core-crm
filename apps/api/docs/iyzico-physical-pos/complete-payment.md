İyzico physical pos
VUK 509 servisleri

VUK 509 servisleri, ödeme işlemlerinin mali mevzuata uyumlu veri yapıları ile yürütülmesini sağlar.
Bu modelde ödeme işlemleri gerçekleştirilirken, mali süreçlerde kullanılacak veri setleri de birlikte iletilir.
VUK 509 kapsamındaki servisler; satış, iade, iptal ve gün sonu işlemlerini kapsar.


Servis Kapsamı
Bu bölümde aşağıdaki servisler yer almaktadır:
	 Satış (Payment)  İşlem Sorgulama   İade (Refund)  İptal (Void)  Gün Sonu (End of Day)


1.Complete Payment

Bu servis, terminal üzerinde ödeme işlemini başlatır. Pos cihazı üzerinde kart okutularak ödeme işlemi tamamlanır. Örnek: "Satış uygulamasının başlattığı işlemi complete ederek ödemeId/authCode vb. alanları alırsınız."
Authorization (Bearer Token):
	 Token değeri OAuth token servisinden dönen access_token'dır.  Header formatı: Authorization: Bearer {access_token}


Örnek istek:

Authorization :Bearer Token ile yetkilendirme. Header formatı: Authorization: Bearer {access_token}
access_token, OAuth token servisinden üretilir ve Terminal Host servislerinde kullanılır.
Body
conversationId - zorunlu alan
string
İstek ve yanıt eşleşmesi yapılacak ID değeri. Üye işyeri tarafından belirlenir, istekte gönderilen bilgi yanıtta geri döner.
locale string - enum - zorunlu alan
Yanıt dili.
Possible values: “tr” | “en”

deviceUniqueId - zorunlu
string
İşlemin gerçekleştirildiği terminal / cihaz için tanımlı benzersiz kimlik bilgisi.

transactionReferenceId - zorunlu
string
Satış uygulaması tarafından üretilen, bu satış işlemine ait uniqueId değeri.
price - zorunlu
number · double
Fiyat Değeri

currency - zorunlu
string
Para birimi

salesType - zorunlu
string · enum
Satış Türü.
Possible values:
“SALE” | “PRE_AUTH” | “POST_AUTH”

paymentId - opsiyonel
string
Ödeme Numarası. Provizyon kapama, (postAuth) işlemi yapılacağı zaman gönderilmesi zorunlu bilgidir.

installment - zorunlu
integer · enum
Taksit Sayısı
Possible values:  “0” | “1” |"2”| “3"| ”4”| ”5” |”6”| ”7”| ”8”| ”9” |”10”| ”11”| “12”




const response = await fetch('https://api.iyzipay.com/v2/terminal-host/payment', {
method: 'POST',
headers: {
"Authorization": "Bearer YOUR_SECRET_TOKEN",
"Content-Type": "application/json"
},
body: JSON.stringify({
"conversationId": "conversation1",
"locale": "TR",
"deviceUniqueId": "PAV860047264",
"transactionReferenceId": "string16",
"price": 100,
"currency": "TRY",
"installment": "0,",
"saleType": "SALE,",
"paymentId": null
})
});

const data = await response.json();




Örnek yanıt Response:

200 success



conversationId
string
İstek–cevap eşleştirmesi ve işlem takibi için üye işyeri tarafından gönderilen benzersiz değer.
locale
string · enum
Yanıt dili
Possible values: tren
deviceUniqueId
string
İşlemin gerçekleştirildiği terminal / cihaz için tanımlı benzersiz kimlik bilgisi.
transactionReferenceId
string
Satış uygulaması tarafından üretilen, işlem bazında benzersiz referans numarası.
status
string
İşlem sonucu. (SUCCESS, FAILURE vb.)
errorCode
string
İşlem başarısız ise dönen hata kodu. Başarılı işlemlerde boş döner.
errorMessage
string
Hata oluşması durumunda açıklayıcı hata mesajı.
errorGroup
string
Hatanın ait olduğu grup / kategori bilgisi.
systemTime
integer · int64
İşlemin iyzico sistemlerinde işlendiği zamanın Unix timestamp değeri.
transactionDateTime
string
İşlemin terminal/host üzerinde gerçekleştiği tarih ve saat bilgisi (ISO-8601).
authCode
string
Banka/host tarafından üretilen onay (authorization) kodu.
paymentId
string
iyzico tarafından üretilen, işlem bazında benzersiz ödeme kimliği.
paymentDate
string
İşlemin muhasebeleştirildiği tarih (YYYYMMDD).
price
number · double
İşlem tutarı.
installment
integer · int32
Taksit sayısı. Tek çekim işlemlerde 0 veya 1 olarak döner.
currency
string
İşlem para birimi (örn. TRY).
binNumber
string
Kartın ilk 6 hanesi (BIN).
lastFourDigits
string
Kart numarasının son 4 hanesi.
hostReference
string
Banka/host sistemi tarafından üretilen işlem referans numarası.
cardType
string
Kart tipi. (CREDIT_CARD, DEBIT_CARD vb.)
acquirerId
string
İşlemi gerçekleştiren banka (acquirer) kurum kimliği.
issuerId
string
Kartı çıkaran banka (issuer) kurum kimliği.
bankMerchantId
string
Banka nezdinde üye işyerine tanımlı merchant numarası.
bankTerminalId
string
Banka nezdinde terminal için tanımlı terminal numarası.
batchNo
string
İşlemin dahil olduğu batch (günsonu) numarası.
stanNo
string
Sistem Takip Numarası (STAN – System Trace Audit Number).
posEntryModeCode
string
Kart bilgilerinin POS'a giriş yöntemini belirten kod (örn. chip, manyetik, contactless).
cancelHostReference
string
İptal işlemi referans numarası
refundHostReference
string
İade işlemi referans numarası


422 error
status
string
İşlem sonucu. (SUCCESS, FAILURE vb.)
errorCode
string
İşlem başarısız ise dönen hata kodu. Başarılı işlemlerde boş döner.
errorMessage
string
Hata oluşması durumunda açıklayıcı hata mesajı.
errorGroup
string
Hatanın ait olduğu grup / kategori bilgisi.
systemTime
integer · int64
İşlemin iyzico sistemlerinde işlendiği zamanın Unix timestamp değeri.
consumerErrorMessage
string
Son kullanıcıya gösterilmek üzere üretilmiş, teknik detay içermeyen hata mesajı.
