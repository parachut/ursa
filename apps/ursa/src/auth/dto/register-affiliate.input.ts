import { IsEmail, Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType()
export class RegisterAffiliateInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  first!: string;

  @Field()
  last!: string;

  @Field()
  @Length(10)
  phone!: string;

  @Field({ nullable: true })
  instagram?: string;

  @Field({ nullable: true })
  businessName?: string;

  @Field({ nullable: true })
  website?: string;
}
