import { Field, InputType } from 'type-graphql';

@InputType()
export class BankAccountCreateInput {
  @Field()
  accountId!: string;

  @Field()
  token!: string;

  @Field({ nullable: true })
  last4?: number;

  @Field({ nullable: true })
  dob?: string;
}
