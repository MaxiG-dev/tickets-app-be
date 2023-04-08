import { Injectable, Logger } from '@nestjs/common';
import AWS from 'aws-sdk';

@Injectable()
export class AppService {
  private logger = new Logger('App Service');
  constructor() {
    if (process.env.RUN_AWS_CONFIG === 'true') {
      this.runAwsConfig();
      this.createDynamoDBTable();
      this.createS3Bucket();
    }
  }

  private runAwsConfig() {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    try {
      AWS.config.update({ credentials, region: process.env.AWS_REGION });
    } catch (error) {
      this.logger.error('Cannot configure AWS, check your credentials', error);
    }

    this.logger.log('AWS configured successfully');
  }

  private async createDynamoDBTable() {
    const dynamoDB = new AWS.DynamoDB();

    const params = {
      TableName: process.env.AWS_DYNAMODB_TABLE,
      KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
      BillingMode: 'PAY_PER_REQUEST',
    };

    dynamoDB
      .createTable(params)
      .promise()
      .then(() => {
        this.logger.log('DynamoDB Table created successfully');
      })
      .catch((error) => {
        if (error.code === 'ResourceInUseException') {
          this.logger.warn('Cannot create a DynamoDB Table, it already exists');
        } else {
          this.logger.error('Cannot create a DynamoDB Table', error);
        }
      });
  }

  private async createS3Bucket() {
    const s3 = new AWS.S3();

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
    };

    s3.headBucket(params)
      .promise()
      .then(() => {
        this.logger.warn('Cannot create a S3 Bucket, it already exists');
      })
      .catch((error) => {
        if (error.code === 'NotFound') {
          s3.createBucket({ ...params, ACL: 'public-read' })
            .promise()
            .then(() => {
              this.logger.log('S3 Bucket created successfully');
            })
            .catch((error) => {
              this.logger.error('Cannot create a S3 Bucket', error);
            });
        }
      });
  }
}
