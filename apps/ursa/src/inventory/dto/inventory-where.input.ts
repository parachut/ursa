import { InputType, Field, ID } from 'type-graphql';

import { InventoryStatus } from '@app/database/enums';

@InputType()
export class InventoryWhereInput {
  @Field(type => [InventoryStatus], { nullable: true })
  status?: [InventoryStatus];

  @Field(type => ID, { nullable: true })
  id?: string;
}
