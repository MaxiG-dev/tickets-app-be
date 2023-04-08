import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsOptional, IsPositive } from 'class-validator';

@InputType()
export class DeleteInput {
  @IsPositive()
  @Field(() => Number)
  purchaseNumber: number;

  @IsEmail()
  @IsOptional()
  @Field(() => String, { nullable: true })
  email: string;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true, defaultValue: true })
  deleteAction: boolean;
}
