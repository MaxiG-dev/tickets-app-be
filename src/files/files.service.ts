import { Injectable, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { HandleException } from '../common/errors/handle.exceptions';
import { CreateTicketInput } from '../tickets/dto/create-ticket.input';
import { UpdateTicketInput } from '../tickets/dto/update-ticket.input';
import { TicketsService } from '../tickets/tickets.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FilesService {
  s3 = new S3();
  logger = new Logger('FilesService');
  configService: any;
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly handleException: HandleException,
  ) {}
  async createTicket(
    user: User,
    files: any,
    createTicketInput: CreateTicketInput | UpdateTicketInput,
    method: string,
  ) {
    const csv = files.csv ? files.csv[0] : null;
    const image = files.image ? files.image[0] : null;

    if (method === 'create') {
      const ticketExists = await this.ticketsService.find(
        { ...user, rol: ['admin'] },
        {
          purchaseNumber: createTicketInput.purchaseNumber,
          includeDeleted: true,
        },
        null,
        true,
      );
      if (ticketExists.length) {
        this.handleException.newError({ code: 'TicketAlreadyExists' });
      }
    }

    if (csv) {
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Body: csv.buffer,
        ACL: 'public-read',
        Key: `${user.email}/csv/csv-ticket-nro-${createTicketInput.purchaseNumber}`,
      };
      const response = await this.s3
        .upload(uploadParams)
        .promise()
        .then((data) => {
          return data.Location;
        })
        .catch((err) => {
          this.logger.error('Error uploading the csv', err);
          this.handleException.newError({ code: 'ErrorUploadingCsv' });
        });
      createTicketInput.purchaseDetail = response;
    }

    if (image) {
      const imageExtension = image.mimetype.split('/')[1];
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Body: image.buffer,
        ACL: 'public-read',
        Key: `${user.email}/image/img-ticket-nro-${createTicketInput.purchaseNumber}`,
        ContentType: `image/${imageExtension}`,
      };
      const response = await this.s3
        .upload(uploadParams)
        .promise()
        .then((data) => {
          return data.Location;
        })
        .catch((err) => {
          this.logger.error('Error uploading the image', err);
          this.handleException.newError({ code: 'ErrorUploadingImage' });
        });
      createTicketInput.imageName = response;
    }
    const response =
      method === 'create'
        ? await this.ticketsService.create(
            user,
            createTicketInput as CreateTicketInput,
          )
        : await this.ticketsService.update(
            user,
            createTicketInput as UpdateTicketInput,
          );
    return response;
  }
}
