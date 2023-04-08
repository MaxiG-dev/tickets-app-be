import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BlockResponse {
  @Field(() => String)
  email: string;

  @Field(() => Boolean)
  isBlocked: boolean;
}
