import { Field, ObjectType, Int } from 'type-graphql';
import { Product } from '@app/database/entities';

@ObjectType()
export class ProductsResponse {
  @Field(type => [Product])
  items: Product[];

  @Field(type => Int)
  total: number;

  @Field(type => Int)
  from: number;

  @Field(type => Int)
  size: number;

  @Field()
  hasMore: boolean;
}
