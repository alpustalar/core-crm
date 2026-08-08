// Backend app'lerinin paylaştığı sabitler. Buradakiler **kayıt defteridir**: adları
// birden fazla servis bilmek zorunda olduğu için tek yerde tutulur (ör. kuyruk adları
// aynı Redis'i paylaşan servisler arasında benzersiz kalmalı).
//
// Bir modüle/servise özgü sabitler (iş adları, retry sayıları, rate limitler) buraya
// GİRMEZ; sahibinin yanında yaşar.
export * from './api-config.constant';
export * from './env.constant';
export * from './error-codes.constant';
export * from './queues.constant';
export * from './response-groups.constant';
export * from './system-actor.constant';
