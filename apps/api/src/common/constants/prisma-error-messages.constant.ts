import { HttpStatus } from '@nestjs/common';

export const PrismaErrorMap: Record<
  string,
  { status: number; message: string; userMessage: string }
> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Unique constraint failed.',
    userMessage:
      'Bu bilgi (e-posta, kullanıcı adı vb.) zaten sistemde kayıtlı.',
  },
  P2011: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Null constraint violation.',
    userMessage:
      'Zorunlu bir alan boş bırakıldı. Lütfen tüm alanları doldurun.',
  },
  P2014: {
    status: HttpStatus.BAD_REQUEST,
    message:
      'The change you are trying to make would violate the required relation.',
    userMessage:
      'Bu işlemi yapamazsınız çünkü bağlı olduğu diğer verilerle olan ilişkisi bozuluyor.',
  },

  // --- BULMA VE GÜNCELLEME HATALARI ---
  P2025: {
    status: HttpStatus.NOT_FOUND,
    message:
      'An operation failed because it depends on one or more records that were required but not found.',
    userMessage:
      'İstediğiniz kayıt bulunamadı. Daha önce silinmiş olabilir veya yetkiniz yok.',
  },
  P2015: {
    status: HttpStatus.NOT_FOUND,
    message: 'A related record could not be found.',
    userMessage: 'Bağlı olan veri bulunamadı veya yetkiniz yok.',
  },
  P2018: {
    status: HttpStatus.BAD_REQUEST,
    message: 'The required connected records were not found.',
    userMessage:
      'İlişkilendirilmesi gereken alt kayıtlar eksik veya hatalı ya da yetkiniz yok.',
  },

  // --- İLİŞKİ VE KISITLAMA HATALARI ---
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Foreign key constraint failed.',
    userMessage:
      'Bu veri başka bir işlemle ilişkili olduğu için işlem gerçekleştirilemedi.',
  },
  P2004: {
    status: HttpStatus.BAD_REQUEST,
    message: 'A constraint failed on the database.',
    userMessage:
      'Veritabanı kısıtlaması aşıldı. Lütfen girdiğiniz verileri kontrol edin.',
  },

  // --- VERİ TİPİ VE BOYUT HATALARI ---
  P2000: {
    status: HttpStatus.BAD_REQUEST,
    message: 'The provided value for the column is too long.',
    userMessage: 'Girdiğiniz veri çok uzun. Lütfen karakter sınırlarına uyun.',
  },
  P2005: {
    status: HttpStatus.BAD_REQUEST,
    message:
      "The value stored in the database for the field is invalid for the field's type.",
    userMessage:
      'Veritabanındaki veri tipi ile gönderilen veri tipi uyuşmuyor.',
  },
  P2006: {
    status: HttpStatus.BAD_REQUEST,
    message: 'The provided value is not valid.',
    userMessage:
      'Geçersiz veri formatı ya da yetkiniz yok. Lütfen bilgilerinizi kontrol edin.',
  },

  // --- TRANSACTION VE TIMEOUT HATALARI ---
  P2024: {
    status: HttpStatus.REQUEST_TIMEOUT,
    message: 'Timed out fetching a new connection from the connection pool.',
    userMessage:
      'Sunucu yoğunluğu nedeniyle bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.',
  },
  P2028: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Transaction API error.',
    userMessage:
      'İşlem (Transaction) sırasında bir hata oluştu. Veriler kaydedilemedi.',
  },

  // --- GENEL SORGU HATALARI ---
  P2012: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Missing a required value.',
    userMessage: 'Eksik veri gönderildi. Lütfen formu kontrol edin.',
  },
  P2021: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'The table does not exist in the current database.',
    userMessage:
      'Veritabanı şeması güncel değil. Lütfen sistem yöneticisine danışın.',
  },
};
