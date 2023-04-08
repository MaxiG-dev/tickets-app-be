import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

@InputType()
export class SignupInput {
  @IsEmail()
  @Field()
  email: string;

  @IsStrongPassword()
  @Field()
  password: string;

  @Length(3, 20)
  @Field()
  username: string;

  @IsOptional()
  @IsArray()
  @IsIn(['user', 'admin'], { each: true })
  @IsString({ each: true })
  @Field(() => [String], { defaultValue: ['user'] })
  rol: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { defaultValue: [] })
  tickets: string[];

  @IsOptional()
  @IsBoolean()
  @Field({ defaultValue: false })
  isBlocked: boolean;
}
