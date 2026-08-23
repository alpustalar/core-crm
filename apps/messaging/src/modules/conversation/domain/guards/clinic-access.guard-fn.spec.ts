import { ActorContext } from '@common/interfaces';
import { assertActorCanAccessClinic } from './clinic-access.guard-fn';
import { ConversationAccessDeniedException } from '@modules/conversation/domain/exceptions/conversation.exceptions';

/**
 * Bu kontrol eklenmeden önce `clinicId` URL'den alınıp doğrudan sorguya
 * geçiriliyordu: oturum açmış herhangi bir kullanıcı başka bir kliniğin id'sini
 * yazarak o kliniğin tüm yazışmalarını okuyabiliyordu. Testler kuralın
 * `apps/api`'deki `ClinicPolicy.actorCanAccessTargetClinic` ile aynı kalmasını
 * sabitler.
 */
describe('assertActorCanAccessClinic', () => {
  const actor = (overrides: Partial<ActorContext>): ActorContext =>
    ({
      userId: 'u1',
      email: 'u1@example.com',
      capabilities: [],
      rolePriority: 10,
      ...overrides,
    }) as ActorContext;

  it('aktörün kendi kliniği geçer', () => {
    expect(() =>
      assertActorCanAccessClinic(actor({ clinicId: 'clinic-1' }), 'clinic-1')
    ).not.toThrow();
  });

  it('yönetilen klinikler geçer', () => {
    expect(() =>
      assertActorCanAccessClinic(
        actor({ clinicId: 'clinic-1', managedClinics: [{ id: 'clinic-2' }] }),
        'clinic-2'
      )
    ).not.toThrow();
  });

  it('başka klinik reddedilir', () => {
    expect(() =>
      assertActorCanAccessClinic(actor({ clinicId: 'clinic-1' }), 'clinic-2')
    ).toThrow(ConversationAccessDeniedException);
  });

  it('kliniği olmayan aktör reddedilir', () => {
    // `actor.clinicId` undefined iken kıyas yapılmaz; boş/undefined eşleşmesi
    // herkese açık bir kapı olurdu.
    expect(() =>
      assertActorCanAccessClinic(actor({}), 'clinic-1')
    ).toThrow(ConversationAccessDeniedException);
  });

  it('rolePriority >= 100 her kontrolü atlar (sistem yöneticisi)', () => {
    expect(() =>
      assertActorCanAccessClinic(actor({ rolePriority: 100 }), 'clinic-9')
    ).not.toThrow();
  });

  it('hata yalnız clinicId sızdırır', () => {
    let error!: ConversationAccessDeniedException;
    try {
      assertActorCanAccessClinic(actor({ clinicId: 'clinic-1' }), 'clinic-2');
    } catch (caught) {
      error = caught as ConversationAccessDeniedException;
    }

    expect(error.errorCode).toBe('MESSAGING.CLINIC_ACCESS_DENIED');
    expect(error.meta).toEqual({ clinicId: 'clinic-2' });
  });
});
