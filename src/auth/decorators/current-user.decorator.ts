import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { ValidRoles } from '../enums/valid-roles.enum';

export const CurrentUser = createParamDecorator(
  (roles: ValidRoles[] = [], context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;
    if (!user) {
      throw new InternalServerErrorException(
        'User not found inside the request, please check that you are using the AuthGuard',
      );
    }

    if (roles.length === 0) return user;

    for (const role of roles) {
      if (user.rol.includes(role)) return user;
    }

    throw new ForbiddenException(
      `User ${user.username} doesn't have the required roles [${roles}]`,
    );
  },
);
