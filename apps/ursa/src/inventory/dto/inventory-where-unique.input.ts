import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class InventoryWhereUniqueInput {
  @Field(type => ID)
  id!: string;
}
