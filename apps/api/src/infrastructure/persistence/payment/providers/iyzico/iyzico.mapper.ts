import { InitializeIyzicoInput } from '@src/infrastructure/persistence/payment/providers/iyzico/interfaces/iyzico-provider.interface';
import Iyzipay, { InstallmentInfoResult } from 'iyzipay';
import { InstallmentOption } from '@modules/payment/application/use-cases/iyzico/queries';

export type ToCheckoutFormRequestInput = {
  input: InitializeIyzicoInput;
  conversationId: string;
  callbackUrl: string;
};

export class IyzicoMapper {
  static toInitializeCheckoutFormRequest({
    input,
    conversationId,
    callbackUrl,
  }: ToCheckoutFormRequestInput) {
    const formattedPrice = input.amount.toFixed(2);

    const nameParts = input.patientName.trim().split(' ');
    const name = nameParts[0];
    const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : name;

    const address = {
      contactName: `${name} ${surname}`,
      city: input.clinicCity || 'Istanbul',
      country: 'Turkey',
      address: input.clinicAddress || 'Turkiye',
    };

    return {
      locale: 'TR' as const,
      conversationId,
      price: formattedPrice,
      paidPrice: formattedPrice,
      currency: 'TRY' as const,
      basketId: input.appointmentId || conversationId,
      paymentGroup: 'PRODUCT' as const,
      callbackUrl,
      enabledInstallments: [1, 2, 3, 6, 9, 12],
      buyer: {
        id: input.patientId,
        name,
        surname,
        email: input.patientEmail || 'info@dentalsystem.com',
        gsmNumber: input.patientPhone,
        identityNumber: '11111111111',
        registrationAddress: input.clinicAddress || 'Turkiye',
        ip: input.callbackIp || '127.0.0.1',
        city: input.clinicCity || 'Istanbul',
        country: 'Turkey',
      },
      shippingAddress: address,
      billingAddress: address,
      basketItems: [
        {
          id: input.appointmentId || conversationId,
          name: input.treatmentName || 'Randevu',
          category1: 'Sağlık Hizmetleri',
          itemType: 'VIRTUAL' as const,
          price: formattedPrice,
        },
      ],
    };
  }

  static toInstallmentInfoResult(sdkResult: InstallmentInfoResult) {
    return {
      binNumber: sdkResult.binNumber,
      price: Number(sdkResult.price),
      options: (sdkResult.installmentDetails ?? []).map(
        (d: Iyzipay.InstallmentDetail): InstallmentOption => ({
          installmentNumber: d.installmentNumber,
          totalPrice: Number(d.totalPrice),
          installmentPrice: Number(d.installmentPrice),
          installmentRate: d.installmentRate,
        })
      ),
    };
  }
}
