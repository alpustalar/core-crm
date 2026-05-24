

iyzico Terminal API (Fiziksel Pos) Documentation - Auth işlemleri

Terminal API (Fiziksel Pos)

Login

Terminal API servislerine erişim sağlamak için iyzico OAuth2 kimlik doğrulama yapısı kullanılmaktadır.
Entegrasyon sürecinde öncelikle login işlemi gerçekleştirilir ve ardından access token alınır.
Alınan access token, tüm servis çağrılarında Authorization header içerisinde kullanılır.


Not:
Login ve access token alma adımları, hem VUK 507 hem de VUK 509 entegrasyonları için ortaktır.

Login Akışı
Copy



POST
1- Authorize

https://sandbox-api.iyzipay.com/in-store/oauth2/authorize

const params = new URLSearchParams();

params.append("scope", "iyzipayApiGateway");
params.append("client_id", "cclient_id");
params.append("client_secret", "client_secret");
params.append("response_type", "code");
params.append("username", "username");
params.append("password", "password");
params.append("request_timestamp", "1755677361682");

const response = await fetch(‘https://sandbox-api.iyzipay.com/in-store/oauth2/authorize', {
method: 'POST',
headers: {
"Content-Type": "application/x-www-form-urlencoded"
},
body: params.toString()
});

const data = await response.json();


Bu servis authorization aşamasını başlatır ve "auth code" üretir.
AkışBu servise form-urlencoded body ile istek atılır.Yanıttaki "code" değeri alınır.Alınan "code" değeri, token üretmek için "Get Token with Auth Code" servisinde kullanılır.
Gelecek response örneği:

200 success
bütün hepsi opsiyonel

{
"code": "O6C8tPb0iHee-V_2Kr1stc3AGNzCMziBHjeEmQSgkz7nGuEMeu01ZfvkJSRIEpW0RbtooPNX1YRw_4cGaxVD6ENXPjc01IrnO-REiuzkvjdeYOXDclwZMx-KlJU8rC3n",
"issuedAt": "2025-12-25T14:05:49.379055098+03:00",
"expiredAt": "2025-12-25T14:15:49.379055098+03:00"
}
400 Error
{
"errorCode": "unsupported_response_type",
"description": "OAuth 2.0 Parameter: response_type",
"uri": ""
}


POST
2 - Get Token with Auth Code

Bu servis, auth code kullanarak access_token ve refresh_token üretir.
Authorization (Basic Auth):	Username: client_idPassword: client_secret Header formatı: Authorization: Basic base64(client_id:client_secret)

Akış (Auth Code)
/authorize çağrısından dönen "code" alınır.Bu servise form-urlencoded body ile gönderilir:
	grant_type=authorization_codecode={authCode}
	Response içinden:
	access_token: Terminal Host servislerinde Bearer Token olarak kullanılır.refresh_token: Token yenileme için saklanır.expires_in: access_token geçerlilik süresi (sn).


Authorization
string
Basic Auth ile yetkilendirme. Postman Basic Auth alanları:
Username: client_id
Password: client_secret
HTTP header karşılığı: Authorization: Basic base64(client_id:client_secret)
Body içinde ;;

Authorization Code ile ya da RefreshToken ile JWT token üretir. client_id ve client_secret ile Basic Auth yapılır.

grant_type
string · enum
Token Üretilecek İşlem Türü
Possible values: authorization_code, refresh_token
code
string
Authorization aşamasında üretilen authCode değeri.



https://sandbox-api.iyzipay.com/in-store/oauth2/token

const params = new URLSearchParams();

params.append("grant_type", "authorization_code");
params.append("code", "{{authCode}}");

const response = await fetch(‘https://sandbox-api.iyzipay.com/in-store/oauth2/token', {
method: 'POST',
headers: {
"Authorization": "Basic username:password",
"Content-Type": "application/x-www-form-urlencoded"
},
body: params.toString()
});

const data = await response.json();


Dönecek örnek data

200 success

{
"access_token": "eyJraWQiOiI4M2Q0NDExYy05M2EzLTRiOWQtOGUwYi0xM2JjZGYxMGZmNTYiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyMSIsImRldmljZU1lbWJlcklkIjoyLCJpc3MiOiJodHRwOi8vMTcyLjIzLjMwLjIyOTo4MDgwIiwiYXV0aG9yaXRpZXMiOlsicG9zX29wZXJhdGlvbnMiXSwiYXVkIjoibWVyY2hhbnQtMS1lY3IxLWludGVncmF0aW9uIiwibmJmIjoxNzY4MjI5NzQ0LCJzY29wZSI6WyJpeXppcGF5QXBpR2F0ZXdheSJdLCJhdXRoRGV2aWNlSWQiOjE0LCJkZXZpY2VNZW1iZXJUeXBlIjoiRUNSX0hPU1QiLCJzaWduaW5nS2V5IjoiUmVKSFpEdTFjMDBxWWFzRjVIZnNYYTJoMENTQ28wNUQiLCJleHAiOjE3NjgyMzY5NDQsImlhdCI6MTc2ODIyOTc0NCwianRpIjoiYzdhMTcwNjctMjEwNC00OGZkLTk5NDMtNzRhNGYwNWYyNGQwIn0.T_fY-zWb3Rw5xdarMHKwX9OKMXEkFoI70o7N1y14cllCB3tOFTp__TDY1rzKU23eaw6dPDHpUSP09eWGJI2XVyhus0hDLwBVyNkObDXPn3DIu55Of0GcfnHi4ic13cpsGG3-M3dg7ri_JSIGle4MkPrRqYXcKVcp4A9mawFnWcWqecdgYJlcQPbwuINXCAUOpQBROg0EEqvuNJwVlQk4aUwm4hgveboGXPAymvc3AbJNzqlljvKrawXRULKcZPFGe8mKFgkUtsvLpYrVhLaQHttAmFKsKmOwDQbugWtZ7jFrGJQPIC6d1Wgkb2xz9gPKB0ic5NIf-tS2hM4lPKQOhw",
"refresh_token": "HKi_OISDcC451HdL90Nb2FzGrrjFEKzOQCSr3dgYRbe76OCi5zRr7dXaVmCTqTPDnqFdSP-MyDrCXMSAtbrUTRRgy11ZqLToARRyJqpCPpujFqabsRzLqoshKTBaKib",
"scope": "iyzipayApiGateway",
"token_type": "Bearer",
"expires_in": 7199
}

400
Error

{
"error": "invalid_grant"
}


401
Error


{
"error": "invalid_client"
}
