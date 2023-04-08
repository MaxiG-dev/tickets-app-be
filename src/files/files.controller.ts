import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTicketInput } from '../tickets/dto/create-ticket.input';
import { User } from '../users/entities/user.entity';
import { FilesService } from './files.service';
import { handlerFileFilter } from './helpers/fileFilter.helper';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('ticket/create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'csv', maxCount: 1 },
        { name: 'image', maxCount: 1 },
      ],
      { fileFilter: handlerFileFilter },
    ),
  )
  createTicket(
    @CurrentUser() user: User,
    @UploadedFiles()
    files: {
      csv?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Body() createTicketInput: CreateTicketInput,
  ) {
    return this.filesService.createTicket(
      user,
      files,
      createTicketInput,
      'create',
    );
  }

  @Post('ticket/update')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'csv', maxCount: 1 },
        { name: 'image', maxCount: 1 },
      ],
      { fileFilter: handlerFileFilter },
    ),
  )
  updateTicket(
    @CurrentUser() user: User,
    @UploadedFiles()
    files: {
      csv?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Body() createTicketInput: CreateTicketInput,
  ) {
    return this.filesService.createTicket(
      user,
      files,
      createTicketInput,
      'update',
    );
  }
}
