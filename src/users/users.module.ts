import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { HandleException } from '../common/errors/handle.exceptions';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [UsersResolver, UsersService, HandleException],
  imports: [forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}
