import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateTicketInput {
  @Field(() => Int)
  @IsPositive()
  purchaseNumber: number;

  @Field()
  @IsString()
  @Length(3, 50)
  title: string;

  @Field()
  @IsString()
  @MinLength(3)
  description: string;

  @Field()
  @MinLength(3)
  problem: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  purchaseDetail: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  imageName: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isDeleted: boolean;
}
