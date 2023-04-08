import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

export class HandleException {
  private logger = new Logger('Error Handler');

  newError(error: any): never {
    if (error.code === 'Unauthorized') {
      throw new ForbiddenException(
        'You are not authorized to perform this action',
      );
    }
    if (error.code === 'EmailNotProvided') {
      throw new BadRequestException(
        'You must provide an user email to perform this action',
      );
    }
    if (error.code === 'EmailAlreadyExists') {
      throw new BadRequestException('This email already registered');
    }
    if (error.code === 'ErrorUploadingCsv') {
      throw new InternalServerErrorException('Error uploading the csv');
    }
    if (error.code === 'ErrorUploadingImage') {
      throw new InternalServerErrorException('Error uploading the image');
    }
    if (error.code === 'PurchaseNumberNotProvided') {
      throw new BadRequestException(
        'You must provide a purchase number to perform this action',
      );
    }
    if (error.code === 'TicketAlreadyExists') {
      throw new BadRequestException('This ticket already exists');
    }
    if (error.code === 'ConditionalCheckFailedException') {
      throw new BadRequestException('This data already exists');
    }
    if (error.code === 'TicketNotFound') {
      throw new NotFoundException('Ticket not found');
    }
    if (error.code === 'UserNotFound') {
      throw new NotFoundException('User not found');
    }
    if (error.code === 'UserNotFoundInThisRange') {
      throw new NotFoundException(
        'User not found in this range, try set a lower limit',
      );
    }
    this.logger.error(error);
    throw new InternalServerErrorException(error);
  }
}
