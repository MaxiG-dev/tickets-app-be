import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsPositive, Max } from 'class-validator';

@InputType()
export class Pagination {
  @IsPositive()
  @Max(100)
  @IsOptional()
  @Field(() => Number, { nullable: true, defaultValue: null })
  limit: number;

  @IsPositive()
  @IsOptional()
  @Field(() => Number, { nullable: true, defaultValue: 1 })
  page: number;
}
