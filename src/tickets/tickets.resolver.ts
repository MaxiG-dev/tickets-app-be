import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { DeleteInput } from './dto/delete.input.type';
import { FilterInput } from './dto/filter-ticket.input';
import { CreateTicketInput } from './dto/create-ticket.input';
import { UpdateTicketInput } from './dto/update-ticket.input';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Pagination } from '../common/dto/pagination.input';

@Resolver(() => Ticket)
@UseGuards(JwtAuthGuard)
export class TicketsResolver {
  constructor(private readonly ticketsService: TicketsService) {}

  @Mutation(() => Ticket)
  createTicket(
    @CurrentUser() user: User,
    @Args('createTicketInput') createTicketInput: CreateTicketInput,
  ) {
    return this.ticketsService.create(user, createTicketInput);
  }

  @Query(() => [User], { name: 'tickets' })
  findTicket(
    @CurrentUser() user: User,
    @Args('filterInput', { nullable: true }) filterInput?: FilterInput,
    @Args('pagination', { nullable: true }) pagination?: Pagination,
  ) {
    return this.ticketsService.find(user, filterInput, pagination);
  }

  @Mutation(() => Ticket)
  updateTicket(
    @CurrentUser() user: User,
    @Args('updateTicketInput') updateTicketInput: UpdateTicketInput,
  ) {
    return this.ticketsService.update(user, updateTicketInput);
  }

  @Mutation(() => Ticket)
  deleteTicket(
    @CurrentUser() user: User,
    @Args('deleteInput', { type: () => DeleteInput })
    deleteInput: DeleteInput,
  ) {
    return this.ticketsService.delete(user, deleteInput);
  }
}
