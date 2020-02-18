import { Field, ID, ObjectType } from 'type-graphql';

import { ShipmentTrackerDetail } from './shipment-tracker-detail.type';

@ObjectType()
export class ShipmentTracker {
  @Field(type => ID)
  id!: string;

  @Field()
  object!: string;

  @Field()
  mode!: string;

  @Field()
  trackingCode!: string;

  @Field()
  status!: string;

  @Field({ nullable: true })
  signedBy?: string;

  @Field()
  carrier!: string;

  @Field({ nullable: true })
  weight?: number;

  @Field({ nullable: true })
  estDeliveryDate?: Date;

  @Field()
  publicUrl!: string;

  @Field(type => [ShipmentTrackerDetail], { nullable: true })
  trackingDetails?: ShipmentTrackerDetail[];

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
