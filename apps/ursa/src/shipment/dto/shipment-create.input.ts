import { ShipmentType, ShipmentDirection } from '@app/database/enums';
import { Field, ID, InputType } from 'type-graphql';

@InputType()
export class ShipmentCreateInput {
  @Field(type => [ID])
  inventoryIds!: string[];

  @Field(type => ShipmentType)
  type!: ShipmentType;

  @Field(type => ShipmentDirection, { nullable: true })
  direction?: ShipmentDirection;

  @Field(type => Boolean, { nullable: true })
  pickup?: boolean;

  expedited?: boolean;
  airbox?: boolean;
  shipKitId?: string;
  returnId?: string;
  cartId?: string;

  width?: number;
  height?: number;
  length?: number;
}
