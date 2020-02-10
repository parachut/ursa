import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class BillingInfoUpdateInput {
  @Field()
  token!: string;
}
