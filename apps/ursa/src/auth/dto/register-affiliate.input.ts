import { UserRole } from '@app/database/enums/user-role.enum';
import { IsEmail, Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { MarketingSourceInput } from './marketing-source.input';

@InputType()
export class RegisterAffiliateInput {
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

  @Field(type => String, { nullable: true })
  visitorId?: string;

  @Field(type => MarketingSourceInput, { nullable: true })
  marketingSource?: MarketingSourceInput;
}
