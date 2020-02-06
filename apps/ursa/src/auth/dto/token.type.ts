import { Field, ObjectType } from 'type-graphql';

import { User } from '@app/database/entities/user.entity';

@ObjectType()
export class Token {
  @Field({ nullable: true })
  token?: string;

  @Field({ nullable: true })
  user?: User;
}
