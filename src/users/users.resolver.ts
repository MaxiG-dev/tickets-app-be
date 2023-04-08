import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { BlockResponse } from './dto/block.response.type';
import { BlockInput } from './dto/block.input.type';
import { Pagination } from '../common/dto/pagination.input';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @CurrentUser([ValidRoles.admin]) _user: User,
    @Args('pagination', { nullable: true }) pagination?: Pagination,
  ): Promise<User[]> {
    return this.usersService.findAll(pagination);
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @CurrentUser() user: User,
    @Args('email', { type: () => String }) email: string,
  ) {
    return this.usersService.findOne(user, email);
  }

  @Mutation(() => User)
  updateUser(
    @CurrentUser() user: User,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.usersService.update(user, updateUserInput);
  }

  @Mutation(() => BlockResponse)
  blockUser(
    @CurrentUser([ValidRoles.admin]) _user: User,
    @Args('blockInput') blockInput: BlockInput,
  ) {
    return this.usersService.block(blockInput);
  }
}
