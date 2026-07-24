import { Expose, Type } from 'class-transformer';

export class ClinicExceptionResponseDto {
  @Expose() id: string;
  @Expose() clinicId: string;

  // --- Temel İstisna ve Tarih Bilgisi (Herkes Görebilir) ---
  @Expose()
  @Type(() => Date)
  date: Date;

  @Expose()
  isClosed: boolean;

  @Expose()
  reason: string | null;
}
