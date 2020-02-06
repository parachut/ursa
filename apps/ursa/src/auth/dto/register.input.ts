import { IsEmail, Length } from 'class-validator';
import { InputType, Field } from 'type-graphql';

import { UserRole } from '@app/database/enums/user-role.enum';
import { MarketingSourceInput } from './marketing-source.input';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  name!: string;

  @Field()
  @Length(10)
  phone!: string;

  @Field(type => [UserRole], { nullable: true })
  roles?: UserRole[];

  @Field(type => MarketingSourceInput, { nullable: true })
  marketingSource?: MarketingSourceInput;
}
