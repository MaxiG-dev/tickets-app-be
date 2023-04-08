import { CreateTicketInput } from './create-ticket.input';
import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateTicketInput extends PartialType(CreateTicketInput) {
  @Field(() => String, { nullable: true })
  @IsEmail()
  @IsOptional()
  email: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsIn([
    'open',
    'closed',
    'in progress',
    'resolved',
    'awaiting customer response',
    'awaiting vendor response',
  ])
  status: string;
}
