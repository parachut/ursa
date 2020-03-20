import { Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { AuthenticateMethod } from './authenticate-method.enum';

@InputType()
export class AuthenticateInput {
  @Field({ nullable: true })
  @Length(10)
  phone?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  identifier?: string;

  @Field({ nullable: true })
  @Length(6)
  passcode?: string;

  @Field(type => AuthenticateMethod, { nullable: true })
  method?: AuthenticateMethod;
}
