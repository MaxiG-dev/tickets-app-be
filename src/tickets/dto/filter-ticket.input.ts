import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

@InputType()
export class FilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => Int, { nullable: true, defaultValue: null })
  @IsOptional()
  @IsPositive()
  purchaseNumber?: number;

  @Field({ nullable: true, defaultValue: null })
  @IsOptional()
  @IsString()
  @MinLength(3)
  filterParam?: string;

  @Field(() => [String], { nullable: true, defaultValue: null })
  @IsOptional({ each: true })
  @IsString({ each: true })
  @IsArray()
  @IsIn(
    [
      'open',
      'closed',
      'in progress',
      'resolved',
      'awaiting customer response',
      'awaiting vendor response',
    ],
    { each: true },
  )
  status?: string[];

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}
