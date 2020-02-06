import { InputType, Field } from 'type-graphql';

@InputType()
export class AddressCreateInput {
  @Field()
  city!: string;

  @Field({ nullable: true })
  primary?: boolean;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  state!: string;

  @Field()
  street!: string;

  @Field({ nullable: true })
  street2?: string;

  @Field()
  zip!: string;
}
