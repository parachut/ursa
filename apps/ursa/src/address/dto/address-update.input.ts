import { InputType, Field } from 'type-graphql';

@InputType()
export class AddressUpdateInput {
  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  primary?: boolean;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  street?: string;

  @Field({ nullable: true })
  zip?: string;
}
