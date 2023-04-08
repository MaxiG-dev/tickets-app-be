import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsOptional } from 'class-validator';

@InputType()
export class BlockInput {
  @IsEmail()
  @Field(() => String)
  email: string;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true, defaultValue: true })
  blockAction: boolean;
}
