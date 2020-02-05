import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { BillingInfoUpdatedBy } from '../types/billing-info-updated-by.type';
import { PaymentMethod } from '../types/payment-method.type';
import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'billing_infos',
  underscored: true,
})
export class BillingInfo extends Model<BillingInfo> {
  @Field(type => ID)
  @PrimaryKey
  @Column
  id!: string;

  @Field({ nullable: true })
  @Column
  company?: string;

  @Field()
  @Column
  firstName!: string;

  @Field()
  @Column
  lastName!: string;

  @Field()
  @Column
  valid!: boolean;

  @Field({ nullable: true })
  @Column
  vatNumber?: string;

  @Field(type => PaymentMethod)
  @Column({
    type: 'json',
  })
  paymentMethod!: PaymentMethod;

  @Field(type => BillingInfoUpdatedBy)
  @Column({
    type: 'json',
  })
  updatedBy!: BillingInfoUpdatedBy;

  @Field()
  @Column
  object!: string;

  @Field()
  @Column
  createdAt!: Date;

  @Field()
  @Column
  updatedAt!: Date;

  @Field({ nullable: true })
  @Column
  deletedAt?: Date;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;
}
