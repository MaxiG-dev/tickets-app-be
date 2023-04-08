import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsResolver } from './tickets.resolver';
import { HandleException } from '../common/errors/handle.exceptions';
import { UsersModule } from '../users/users.module';

@Module({
  exports: [TicketsService],
  providers: [TicketsResolver, TicketsService, HandleException],
  imports: [UsersModule],
})
export class TicketsModule {}
