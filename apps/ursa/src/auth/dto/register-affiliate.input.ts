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

  @Field({ nullable: true })
  instagram?: string;

  @Field({ nullable: true })
  followers?: string;

  @Field({ nullable: true })
  businessName?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  traffic?: string;

  @Field({ nullable: true })
  affiliateType?: string;

  @Field({ nullable: true })
  purpose?: string;

  @Field({ nullable: true })
  promote?: string;

  @Field({ nullable: true })
  brands?: string;
}
