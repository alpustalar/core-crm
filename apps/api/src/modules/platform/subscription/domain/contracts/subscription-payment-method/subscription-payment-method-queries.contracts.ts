/**
 * Yenileme anında kayıtlı kartla tahsilat için gereken düz shape — payment method query repo
 * döner (renewal processor). Entity/token sızmaz; alıcı bilgisi payment.create'i besler.
 */
export interface SavedCardChargeModel {
  cardUserKey: string;
  cardToken: string;
  buyer: {
    name: string;
    surname: string;
    email: string;
    gsmNumber: string;
    ip: string;
    city: string | null;
    address: string | null;
  };
}
