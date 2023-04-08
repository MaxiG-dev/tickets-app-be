import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [SeedController],
  imports: [UsersModule],
  providers: [SeedService],
})
export class SeedModule {}
