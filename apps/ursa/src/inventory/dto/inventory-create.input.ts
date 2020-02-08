import { InputType, Field, ID } from 'type-graphql';

import { InventoryCondition } from '@app/database/enums';

@InputType()
export class InventoryCreateInput {
  @Field(type => ID)
  productId!: string;

  @Field(type => InventoryCondition)
  condition!: InventoryCondition;

  @Field(type => [String], { nullable: true })
  missingEssentials?: string[];
}
