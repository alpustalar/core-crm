import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './infrastructure/firebase.service';
import { FIREBASE_SERVICE_TOKEN } from '@modules/firebase/domain/interfaces/firebase.service.interface';

@Global()
@Module({
  providers: [{ provide: FIREBASE_SERVICE_TOKEN, useClass: FirebaseService }],
  exports: [FIREBASE_SERVICE_TOKEN],
})
export class FirebaseModule {}
