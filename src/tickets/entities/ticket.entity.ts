import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Ticket {
  @Field(() => String)
  purchaseNumber: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  problem: string;

  @Field({ nullable: true })
  purchaseDetail: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  imageName: string;

  @Field()
  createdAt: string;

  @Field({ nullable: true })
  updatedAt?: string;

  @Field({ nullable: true })
  isDeleted: boolean;
}

export class Tickets {
  tickets: Ticket[];
}
