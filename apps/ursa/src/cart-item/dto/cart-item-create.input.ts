import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class CartItemCreateInput {
  @Field(type => ID)
  productId!: string;

  @Field(type => Int, { nullable: true })
  quantity?: number;
}
