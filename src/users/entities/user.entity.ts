import { ObjectType, Field } from '@nestjs/graphql';
import { Ticket } from '../../tickets/entities/ticket.entity';

@ObjectType()
export class User {
  @Field()
  email: string;

  password: string;

  @Field()
  username: string;

  @Field(() => [String], { nullable: true })
  rol: string[];

  @Field(() => [Ticket], { nullable: true })
  tickets: Ticket[];

  @Field({ nullable: true })
  isBlocked: boolean;
  user: Ticket;
}
