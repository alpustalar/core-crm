import { Inject, Injectable } from '@nestjs/common';
import { ITokenVerifier, VerifiedToken } from '@src/auth';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@src/infrastructure/firebase/firebase.service.interface';

/**
 * Çekirdeğin `ITokenVerifier` sınırını mevcut `FirebaseService` ile karşılar.
 *
 * Adapter'ın işi daraltmak: `IFirebaseService` kullanıcı oluşturma/silme/şifre
 * değiştirme de taşıyor; çekirdeğin ve messaging'in bunlara ihtiyacı yok ve
 * görmemeleri gerekiyor.
 */
@Injectable()
export class FirebaseTokenVerifier implements ITokenVerifier {
  constructor(
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService
  ) {}

  async verify(idToken: string): Promise<VerifiedToken | null> {
    const decoded = await this.firebaseService.verifyToken(idToken);
    if (!decoded) return null;

    return { uid: decoded.uid, email: decoded.email };
  }
}
