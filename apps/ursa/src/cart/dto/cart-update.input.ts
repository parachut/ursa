import { Field, InputType } from 'type-graphql';

@InputType()
export class CartUpdateInput {
  @Field({ nullable: true })
  planId?: string;

  @Field({ nullable: true })
  protectionPlan?: boolean;

  @Field({ nullable: true })
  service?: string;

  @Field({ nullable: true })
  couponCode?: string;

  @Field({ nullable: true })
  addressId?: string;
}
