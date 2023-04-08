import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TicketsModule } from '../tickets/tickets.module';
import { HandleException } from '../common/errors/handle.exceptions';

@Module({
  controllers: [FilesController],
  imports: [TicketsModule],
  providers: [FilesService, HandleException],
})
export class FilesModule {}
