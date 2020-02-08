import { InputType, Field, ID } from 'type-graphql';

import { InventoryCondition } from '@app/database/enums';

@InputType()
export class InventoryUpdateInput {
  @Field(type => ID, { nullable: true })
  productId?: string;

  @Field(type => InventoryCondition, { nullable: true })
  condition?: InventoryCondition;

  @Field(type => [String], { nullable: true })
  missingEssentials?: string[];
}
