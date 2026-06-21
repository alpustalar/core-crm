import { Module } from '@nestjs/common';
import { PaxService } from './pax.service';

@Module({
  providers: [PaxService],
  exports: [PaxService],
})
export class PaxModule {}
