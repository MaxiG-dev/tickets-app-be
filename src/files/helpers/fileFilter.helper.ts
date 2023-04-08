import { BadRequestException } from '@nestjs/common';

export const handlerFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const fileExtension = file.mimetype.split('/')[1];

  if (file.fieldname === 'csv' && !typeFiles.csv.includes(fileExtension)) {
    return callback(
      new BadRequestException(
        `Invalid csv file, valid extensions are: ${typeFiles.csv.join()}`,
      ),
      false,
    );
  }

  if (file.fieldname === 'image' && !typeFiles.image.includes(fileExtension)) {
    return callback(
      new BadRequestException(
        `Invalid image, valid extensions are: ${typeFiles.image.join()}`,
      ),
      false,
    );
  }

  callback(null, true);
};

const typeFiles = {
  csv: ['csv'],
  image: ['jpg', 'jpeg', 'png'],
};
