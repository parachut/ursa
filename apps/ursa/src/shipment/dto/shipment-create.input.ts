import { ShipmentType, ShipmentDirection } from '@app/database/enums';
import { Field, ID, InputType } from 'type-graphql';

@InputType()
export class ShipmentCreateInput {
  @Field(type => [ID])
  inventoryIds!: string[];

  @Field(type => ShipmentType)
  type!: ShipmentType;

  @Field(type => ShipmentDirection)
  direction?: ShipmentDirection;

  @Field(type => Boolean)
  expedited?: boolean;
}
