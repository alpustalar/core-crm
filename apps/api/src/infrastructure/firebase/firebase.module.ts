import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { FirebaseService } from './firebase.service';
import {
  FIREBASE_ADMIN_TOKEN,
  FIREBASE_SERVICE,
} from '@src/infrastructure/firebase/firebase.service.interface';

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_ADMIN_TOKEN,
      useFactory: () => {
        const firebaseSDKPath = path.resolve(
          process.cwd(),
          'secrets',
          'firebase-sdk.json'
        );

        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(firebaseSDKPath),
          });
        }

        return admin;
      },
    },
    {
      provide: FIREBASE_SERVICE,
      useClass: FirebaseService,
    },
  ],
  exports: [FIREBASE_SERVICE],
})
export class FirebaseModule {}
