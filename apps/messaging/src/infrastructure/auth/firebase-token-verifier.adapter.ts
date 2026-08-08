import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { ITokenVerifier, VerifiedToken } from '@src/auth';

/**
 * Token imzasını **yerel olarak** doğrular.
 *
 * Firebase kimlik doğrulaması Google'ın açık anahtarlarıyla yapılan bir JWT imza
 * kontrolüdür; veritabanı gerektirmez. Bu yüzden messaging bunu kendisi yapar ve her
 * istek için core'a bir tur atmaz. Core'a yalnız cache-miss'te, `ActorContext`
 * çözümlemesi için gidilir.
 */
@Injectable()
export class FirebaseTokenVerifier implements ITokenVerifier {
  private readonly logger = new Logger(FirebaseTokenVerifier.name);

  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          path.resolve(process.cwd(), 'secrets', 'firebase-sdk.json')
        ),
      });
    }
  }

  async verify(idToken: string): Promise<VerifiedToken | null> {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      return { uid: decoded.uid, email: decoded.email };
    } catch (err) {
      // Süresi dolmuş/bozuk token beklenen bir durumdur; guard bunu 401'e çevirir.
      this.logger.debug(
        `Token doğrulanamadı: ${err instanceof Error ? err.message : err}`
      );
      return null;
    }
  }
}
