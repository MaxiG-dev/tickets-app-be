import { Injectable, Logger } from '@nestjs/common';
import AWS from 'aws-sdk';
import { UsersService } from '../users/users.service';
import { tickets } from './data/tickets';
import { users } from './data/users';

@Injectable()
export class SeedService {
  private logger = new Logger('Seed Service');
  constructor(private readonly userService: UsersService) {}

  async execute() {
    if (process.env.RUN_ADMIN_CONFIG_IN_SEED === 'true') {
      this.createDefaultAdmin();
    }

    const usersToInsert = [];

    let ticketsCount = 0;

    users.forEach((user) => {
      for (
        let i = 0 + ticketsCount;
        i < user.tickets.count + ticketsCount;
        i++
      ) {
        const ticket = tickets[i];
        const purchaseNumber = +ticket.purchaseNumber;
        delete ticket.purchaseNumber;
        user.tickets[purchaseNumber] = ticket;
      }
      ticketsCount += user.tickets.count;
      delete user.tickets.count;
      usersToInsert.push(user);
    });

    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    const table = {};

    table[process.env.AWS_DYNAMODB_TABLE] = users.map((user) => {
      return {
        PutRequest: {
          Item: user,
        },
      };
    });

    const params = {
      RequestItems: table,
    };

    const result = dynamoDB
      .batchWrite(params)
      .promise()
      .then(() => 'Seed executed successfully!')
      .catch((err) => {
        this.logger.warn('Failed to execute seed', err);
        return 'Failed to execute seed, check the server logs';
      });
    return result;
  }

  private async createDefaultAdmin() {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      this.userService
        .create(
          {
            email: adminEmail,
            password: adminPassword,
            username: 'admin',
            rol: ['admin'],
            tickets: [],
            isBlocked: false,
          },
          true,
        )
        .then(() => {
          this.logger.log('Admin created successfully');
        })
        .catch((error) => {
          if (error.code == 'ResourceNotFoundException') {
            this.logger.error(
              `Cannot create a default admin, DynamoDB Table does not exist.
              If you created the DynamoDB Table, please wait a few seconds and try again.`,
            );
          }
          this.logger.warn('Cannot create a default admin, it already exists');
        });
    }
  }
}
