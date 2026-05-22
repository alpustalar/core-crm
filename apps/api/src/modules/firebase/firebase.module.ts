import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './infrastructure/firebase.service';
import { FIREBASE_SERVICE } from '@modules/firebase/domain/interfaces/firebase.service.interface';

@Global()
@Module({
  providers: [{ provide: FIREBASE_SERVICE, useClass: FirebaseService }],
  exports: [FIREBASE_SERVICE],
})
export class FirebaseModule {}
