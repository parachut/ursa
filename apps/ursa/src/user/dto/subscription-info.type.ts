import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class SubscriptionInfo {
  @Field()
  planName!: string;

  @Field()
  subtotal!: number;

  @Field()
  nextBillingDate!: Date;

  @Field()
  protectionPlan!: boolean;

  @Field()
  additionalItems!: number;
}
