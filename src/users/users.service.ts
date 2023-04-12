import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { BlockInput } from './dto/block.input.type';
import { SignupInput } from '../auth/dto/signup.input';
import { AuthService } from '../auth/auth.service';
import { Pagination } from '../common/dto/pagination.input';
import { HandleException } from '../common/errors/handle.exceptions';
import bcrypt from 'bcryptjs';
import AWS from 'aws-sdk';

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly handleException: HandleException,
  ) {}

  private dynamoDB = new AWS.DynamoDB.DocumentClient();

  async create(signupInput: SignupInput, createAdmin = false): Promise<User> {
    let rol = ['user'];
    if (createAdmin) rol = ['admin'];

    const params = {
      TableName: process.env.AWS_DYNAMODB_TABLE,
      Item: {
        ...signupInput,
        rol,
        tickets: {},
        password: bcrypt.hashSync(signupInput.password, 8),
      },
      ConditionExpression: 'attribute_not_exists(email)',
    };

    const response = await this.dynamoDB
      .put(params)
      .promise()
      .then(() => {
        return { ...signupInput, tickets: {} } as User;
      })
      .catch((error) => {
        if (error.code === 'ConditionalCheckFailedException') {
          this.handleException.newError({ code: 'EmailAlreadyExists' });
        }
        this.handleException.newError(error);
      });
    return response;
  }

  async findAll(pagination?: Pagination): Promise<User[]> {
    const limit = pagination?.limit ? pagination.limit : undefined;
    const page = pagination?.page ? pagination.page : 1;

    const params = {
      TableName: process.env.AWS_DYNAMODB_TABLE,
      Limit: limit ? limit * page : undefined,
    };

    const response = await this.dynamoDB
      .scan(params)
      .promise()
      .then((data) => {
        if (!data.Items.length) {
          this.handleException.newError({ code: 'UserNotFound' });
        }
        let LimitUsers = [];

        if (limit) {
          for (
            let i = limit * page - limit;
            i < data.Items.length && i < limit * page;
            i++
          ) {
            LimitUsers.push(data.Items[i]);
          }
        } else {
          LimitUsers = data.Items;
        }
        return LimitUsers.map((user) => {
          delete user.password;
          const ticketList = [];
          for (const key in user.tickets) {
            ticketList.push({
              purchaseNumber: key,
              ...user.tickets[key],
            });
          }
          user.tickets = ticketList;
          return user;
        });
      })
      .catch((error) => {
        this.handleException.newError(error);
      });
    return response as User[];
  }

  async findOne(user?: User, email?: string) {
    if (user) {
      this.authService.validateUserHasAuthorization(email, user);
    }

    email ? email : (email = user.email);

    const params = {
      ExpressionAttributeValues: {
        ':email': email,
      },
      KeyConditionExpression: 'email = :email',
      TableName: process.env.AWS_DYNAMODB_TABLE,
    };

    const response = await this.dynamoDB
      .query(params)
      .promise()
      .then((data) => {
        if (!data.Items.length) {
          this.handleException.newError({ code: 'UserNotFound' });
        }

        const ticketList = [];

        for (const key in data.Items[0].tickets) {
          ticketList.push({
            purchaseNumber: key,
            ...data.Items[0].tickets[key],
          });
        }
        data.Items[0].tickets = ticketList;
        return data.Items[0];
      })
      .catch((error) => {
        this.handleException.newError(error);
      });
    return response as User;
  }

  async update(user: User, updateUserInput: UpdateUserInput) {
    const { email, password, username, rol, tickets, isBlocked } =
      updateUserInput;

    this.authService.validateUserHasAuthorization(email, user);
    if (rol && !user.rol.includes('admin')) {
      this.handleException.newError({ code: 'Unauthorized' });
    }

    const userToUpdate = {
      ':newpassword': password ? bcrypt.hashSync(password, 8) : undefined,
      ':newusername': username ? username : undefined,
      ':newrol': rol ? rol : undefined,
      ':newtickets': tickets ? tickets : undefined,
      ':newisBlocked': isBlocked ? isBlocked : undefined,
    };

    let updateExpression = 'SET ';

    for (const key in userToUpdate) {
      if (userToUpdate[key]) {
        updateExpression += `${key.substring(4)} = ${key},`;
      }
    }

    const params = {
      TableName: process.env.AWS_DYNAMODB_TABLE,
      Key: {
        email,
      },
      UpdateExpression: updateExpression.substring(
        0,
        updateExpression.length - 1,
      ),
      ExpressionAttributeValues: userToUpdate,
      ReturnValues: 'UPDATED_NEW',
    };

    const response = await this.dynamoDB
      .update(params)
      .promise()
      .then(() => {
        return { ...user, ...updateUserInput } as User;
      })
      .catch((error) => {
        if (error.code === 'ConditionalCheckFailedException') {
          this.handleException.newError({ code: 'UserNotFound' });
        }
        this.handleException.newError(error);
      });
    return response;
  }

  async block(blockInput: BlockInput) {
    const { email, blockAction } = blockInput;
    const params = {
      TableName: process.env.AWS_DYNAMODB_TABLE,
      Key: {
        email,
      },
      UpdateExpression: 'SET isBlocked = :newisBlocked',
      ExpressionAttributeValues: {
        ':newisBlocked': blockAction,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const response = await this.dynamoDB
      .update(params)
      .promise()
      .then((data) => {
        return data.Attributes;
      })
      .catch((error) => {
        if (error.code === 'ConditionalCheckFailedException') {
          this.handleException.newError({ code: 'UserNotFound' });
        }
        this.handleException.newError(error);
      });
    return { email, ...response };
  }
}
