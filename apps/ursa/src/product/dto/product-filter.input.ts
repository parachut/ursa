import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class ProductFilterInput {
  @Field(type => ID, { nullable: true })
  id?: string;

  @Field(type => String, { nullable: true })
  search?: string;

  @Field(type => String, { nullable: true })
  brand?: string;

  @Field(type => Boolean, { nullable: true, defaultValue: false })
  inStock?: boolean;

  @Field(type => Int, { nullable: true, defaultValue: 100000 })
  maxPoints?: number;

  @Field(type => Int, { nullable: true, defaultValue: 0 })
  minPoints?: number;
}
