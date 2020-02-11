import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class ShipmentTrackerLocation {
  @Field()
  object!: string;

  @Field()
  city!: string;

  @Field()
  state!: string;

  @Field()
  couontry!: string;

  @Field({ nullable: true })
  zip?: string;
}

@ObjectType()
export class ShipmentTrackerDetail {
  @Field()
  object!: string;

  @Field()
  message!: string;

  @Field()
  status!: string;

  @Field()
  datetime!: Date;

  @Field({ nullable: true })
  source?: string;

  @Field(type => [ShipmentTrackerLocation], { nullable: true })
  trackingLocation?: ShipmentTrackerLocation;
}
