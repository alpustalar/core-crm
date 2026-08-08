import { Global, Module } from '@nestjs/common';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';

@Global()
@Module({
  providers: [TokenCipherService],
  exports: [TokenCipherService],
})
export class CryptoModule {}
