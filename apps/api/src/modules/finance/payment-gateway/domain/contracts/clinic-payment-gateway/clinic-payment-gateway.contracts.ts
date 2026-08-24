/**
 * ClinicPaymentGateway domain kontratları. Entity static `create()` girişi (Props).
 */

/**
 * `iyzicoSubMerchantKey` iyzico'nun alt üye işyeri (Sub-Merchant) API yanıtından
 * gelir — kullanıcı girdisi değildir (bkz. RegisterClinicPaymentGatewayHandler),
 * bu yüzden format doğrulaması burada değil sağlayıcı entegrasyonunda yaşar.
 */
export interface CreateClinicPaymentGatewayProps {
  id?: string;
  clinicId: string;
  iyzicoSubMerchantKey: string;
}
