import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  MinLength,
  Length,
} from 'class-validator';
import { CreateTicketInput } from '../../tickets/dto/create-ticket.input';

@InputType()
export class CreateUserInput {
  @IsEmail()
  @Field()
  email: string;

  @MinLength(8)
  @Field()
  password: string;

  @Length(3, 20)
  @Field()
  username: string;

  @IsOptional()
  @IsArray()
  @IsIn(['user', 'admin'], { each: true })
  @Field(() => [String])
  rol: string[];

  @IsOptional()
  @Field(() => CreateTicketInput, { nullable: true })
  tickets?: CreateTicketInput;

  @IsOptional()
  @IsBoolean()
  @Field({ defaultValue: false })
  isBlocked: boolean;
}
