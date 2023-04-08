import { Injectable } from '@nestjs/common';
import { DeleteInput } from './dto/delete.input.type';
import { FilterInput } from './dto/filter-ticket.input';
import { CreateTicketInput } from './dto/create-ticket.input';
import { UpdateTicketInput } from './dto/update-ticket.input';
import { User } from '../users/entities/user.entity';
import { HandleException } from '../common/errors/handle.exceptions';
import { UsersService } from '../users/users.service';
import { stringParse } from '../common/helpers/parse-string';
import { Pagination } from '../common/dto/pagination.input';
import AWS from 'aws-sdk';

@Injectable()
export class TicketsService {
  dynamoDB = new AWS.DynamoDB.DocumentClient();
  constructor(
    private readonly userService: UsersService,
    private readonly handleException: HandleException,
  ) {}

  async create(user: User, createTicketInput: CreateTicketInput) {
    const { purchaseNumber, ...restTicketInput } = createTicketInput;

    // !! !! !! This is a temporary solution !! !! !!
    // TODO: NOT validate if the ticket exists, try to create it and catch the error if it exists in the database
    // !! !! !! This is a temporary solution !! !! !!

    const ticketExists = await this.find(
      { ...user, rol: ['admin'] },
      {
        purchaseNumber,
        includeDeleted: true,
      },
      null,
      true,
    );
    if (ticketExists.length) {
      this.handleException.newError({ code: 'TicketAlreadyExists' });
    }

    const newTicket = {
      purchaseDetail: null,
      imageName: null,
      createdAt: Date.now(),
      status: 'open',
      ...restTicketInput,
    };

    const params = {
      TableName: process.env.AWS_DYNAMODB_TABLE,
      Key: {
        email: user.email,
      },
      UpdateExpression: 'SET tickets.#purchaseNumber = :newTicket',
      ConditionExpression: 'attribute_not_exists(tickets.#purchaseNumber)',
      ExpressionAttributeNames: {
        '#purchaseNumber': purchaseNumber.toString(),
      },
      ExpressionAttributeValues: {
        ':newTicket': newTicket,
      },
    };

    const response = await this.dynamoDB
      .update(params)
      .promise()
      .then(() => {
        return { purchaseNumber, ...newTicket };
      })
      .catch((error) => {
        if (error.code === 'ConditionalCheckFailedException') {
          this.handleException.newError({ code: 'TicketAlreadyExists' });
        }
        this.handleException.newError(error);
      });
    return response;
  }

  async find(
    user: User,
    filterInput: FilterInput,
    pagination?: Pagination,
    checkBeforeCreateNewTicket = false,
  ) {
    const isAdmin = user.rol.includes('admin');
    const filterDefault: FilterInput = {
      email: null,
      purchaseNumber: null,
      filterParam: null,
      status: null,
      includeDeleted: false,
      ...filterInput,
    };

    const { email, purchaseNumber, filterParam, status, includeDeleted } =
      filterDefault;

    if (!isAdmin && includeDeleted) {
      this.handleException.newError({ code: 'Unauthorized' });
    }

    let users = await this.findUsersWithTickets(
      user,
      email,
      includeDeleted,
      pagination,
    );

    if (purchaseNumber && users.length) {
      users = this.filterTicketsByPurchaseNumber(users, purchaseNumber);
    }

    if (filterParam && users.length) {
      users = this.filterTicketsByParam(users, filterParam);
    }

    if (status && users.length) {
      users = this.filterTicketsByStatus(users, status);
    }

    if (!users.length && !checkBeforeCreateNewTicket) {
      this.handleException.newError({ code: 'TicketNotFound' });
    }
    return users;
  }

  async update(user: User, updateTicketInput: UpdateTicketInput) {
    const {
      purchaseNumber,
      title,
      description,
      problem,
      status,
      imageName,
      purchaseDetail,
    } = updateTicketInput;

    if (!purchaseNumber) {
      this.handleException.newError({ code: 'PurchaseNumberNotProvided' });
    }

    const isAdmin = user.rol.includes('admin');

    const email = updateTicketInput.email
      ? updateTicketInput.email
      : !isAdmin
      ? user.email
      : this.handleException.newError({ code: 'EmailNotProvided' });

    if (!isAdmin && email !== user.email) {
      this.handleException.newError({ code: 'Unauthorized' });
    }

    const ticketToUpdate = {
      ':newtitle': title ? title : undefined,
      ':newdescription': description ? description : undefined,
      ':newproblem': problem ? problem : undefined,
      ':newstatus': status ? status : undefined,
      ':newimageName': imageName ? imageName : undefined,
      ':newpurchaseDetail': purchaseDetail ? purchaseDetail : undefined,
      ':newupdatedAt': Date.now(),
    };

    let updateExpression = 'SET ';

    for (const key in ticketToUpdate) {
      if (ticketToUpdate[key]) {
        updateExpression += `tickets.#purchaseNumber.${key.substring(
          4,
        )} = ${key},`;
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
      ConditionExpression: 'tickets.#purchaseNumber.isDeleted <> :t',
      ExpressionAttributeNames: {
        '#purchaseNumber': purchaseNumber.toLocaleString(),
      },
      ExpressionAttributeValues: { ...ticketToUpdate, ':t': true },
      ReturnValues: 'ALL_NEW',
    };

    const response = await this.dynamoDB
      .update(params)
      .promise()
      .then((data) => {
        return { purchaseNumber, ...data.Attributes.tickets[purchaseNumber] };
      })
      .catch((error) => {
        if (error.code === 'ConditionalCheckFailedException') {
          this.handleException.newError({ code: 'TicketNotFound' });
        }
        this.handleException.newError(error);
      });

    return response;
  }

  async delete(user: User, deleteInput: DeleteInput) {
    const { purchaseNumber, deleteAction, email } = deleteInput;
    const isAdmin = user.rol.includes('admin');

    // TODO: If email is null, set email to user.email
    if (
      (!isAdmin && !deleteAction) ||
      (!isAdmin && (!email || email !== user.email))
    ) {
      this.handleException.newError({ code: 'Unauthorized' });
    }

    const users = await this.find(user, {
      purchaseNumber,
      email,
      includeDeleted: isAdmin,
    });

    const params = {
      TableName: process.env.AWS_DYNAMODB_TABLE,
      Key: {
        email: users[0].email,
      },
      UpdateExpression: 'SET tickets.#purchaseNumber.isDeleted = :newisDeleted',
      ExpressionAttributeNames: {
        '#purchaseNumber': purchaseNumber.toLocaleString(),
      },
      ExpressionAttributeValues: {
        ':newisDeleted': deleteAction,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const response = await this.dynamoDB
      .update(params)
      .promise()
      .then((data) => {
        return {
          ...users[0].tickets[0],
          ...data.Attributes.tickets[purchaseNumber],
        };
      })
      .catch((error) => {
        if (error.code === 'ConditionalCheckFailedException') {
          this.handleException.newError({ code: 'TicketNotFound' });
        }
        this.handleException.newError(error);
      });

    return response;
  }

  async findUsersWithTickets(
    user: User,
    email?: string,
    includeDeleted = false,
    pagination?: Pagination,
  ) {
    const limit = pagination?.limit ? pagination.limit : undefined;
    const page = pagination?.page ? pagination.page : 1;

    const isAdmin = user.rol.includes('admin');
    let users: User[];

    if (email) {
      users = [await this.userService.findOne(user, email)];
    }

    if (!email && !isAdmin) {
      users = [await this.userService.findOne(user, user.email)];
    }

    if (!email && isAdmin) {
      users = await this.userService.findAll();
    }

    const UserWithTickets = [];

    users.forEach((user) => {
      if (!includeDeleted) {
        user.tickets = user.tickets.filter(
          (ticket) => ticket.isDeleted !== true,
        );
      }
      if (user.tickets.length && !user.isBlocked) {
        UserWithTickets.push(user);
      }
    });

    let LimitUsers = [];

    if (limit) {
      for (
        let i = limit * page - limit;
        i < UserWithTickets.length && i < limit * page;
        i++
      ) {
        LimitUsers.push(UserWithTickets[i]);
      }
    } else {
      LimitUsers = UserWithTickets;
    }

    return LimitUsers;
  }

  filterTicketsByPurchaseNumber(users: User[], purchaseNumber: number) {
    const user = users.filter((user) => {
      let ticketFind = false;
      user.tickets = user.tickets.filter((ticket) => {
        return +ticket.purchaseNumber === purchaseNumber;
      });
      if (user.tickets.length) ticketFind = true;
      return ticketFind;
    });
    return user;
  }

  filterTicketsByParam(users: User[], filterParam: string) {
    filterParam = stringParse(filterParam);

    users = users.filter((user) => {
      user.tickets = user.tickets.filter((ticket) => {
        let { title, description, problem } = ticket;
        title = stringParse(title);
        description = stringParse(description);
        problem = stringParse(problem);
        return (
          title.includes(filterParam) ||
          description.includes(filterParam) ||
          problem.includes(filterParam)
        );
      });
      return user.tickets.length ? true : false;
    });

    return users;
  }

  filterTicketsByStatus(users: User[], status: string[]) {
    users = users.filter((user) => {
      user.tickets = user.tickets.filter((ticket) => {
        return status.includes(ticket.status);
      });
      return user.tickets.length ? true : false;
    });
    return users;
  }
}
