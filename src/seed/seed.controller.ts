import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('api')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('seed')
  executeSeed() {
    return this.seedService.execute();
  }
}
