import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class CartWhereUniqueInput {
  @Field(type => ID)
  id!: string;
}
