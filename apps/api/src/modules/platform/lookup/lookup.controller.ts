import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LookupService } from '@modules/platform/lookup/lookup.service';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { citiesAndDistricts } from '@common/assets';

@UseGuards(AuthGuard)
@Controller('look-up')
export class LookupController {
  constructor(private readonly lookupService: LookupService) {}
  @Get('cities-and-districts')
  getCitiesAndDistricts() {
    return citiesAndDistricts;
  }
  @Get('cities')
  getCities() {
    return this.lookupService.cities();
  }
  @Get('districts')
  getDistricts(@Query('cityId', ParseIntPipe) cityId: number) {
    return this.lookupService.districts(cityId);
  }
}
