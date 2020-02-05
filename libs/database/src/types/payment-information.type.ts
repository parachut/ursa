import { Field, Int, ObjectType } from 'type-graphql';

import { PaymentMethod } from './payment-method.type';

@ObjectType()
export class PaymentInformation {
  @Field()
  id!: string;

  @Field(type => PaymentMethod)
  paymentMethod!: PaymentMethod;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;
}
