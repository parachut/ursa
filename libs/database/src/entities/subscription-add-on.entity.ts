import {
  BelongsTo,
  Column,
  Model,
  PrimaryKey,
  Table,
  ForeignKey,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { PlanAddOn } from './plan-add-on.entity';
import { Subscription } from './subscription.entity';

@ObjectType()
@Table({
  tableName: 'subscription_add_ons',
  underscored: true,
})
export class SubscriptionAddOn extends Model<SubscriptionAddOn> {
  @Field(type => ID)
  @PrimaryKey
  @Column
  id!: string;

  @Field()
  @Column
  object!: string;

  @Field()
  @Column
  quantity!: number;

  @Field({ nullable: true })
  @Column({ type: 'real' })
  unitAmount?: number;

  @Field()
  @Column
  createdAt!: Date;

  @Field({ nullable: true })
  @Column
  expiredAt?: Date;

  @ForeignKey(() => Subscription)
  @Column
  subscriptionId!: string;

  @BelongsTo(() => Subscription, 'subscriptionId')
  subscription!: Subscription;

  @ForeignKey(() => PlanAddOn)
  @Column
  planAddOnId!: string;

  @BelongsTo(() => PlanAddOn, 'planAddOnId')
  planAddOn!: PlanAddOn;
}
