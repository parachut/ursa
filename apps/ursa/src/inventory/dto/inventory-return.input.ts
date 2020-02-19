import { Field, InputType } from 'type-graphql';

@InputType()
export class InventoryReturnInput {
  @Field(type => String)
  reason?: string;
}
