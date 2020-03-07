import EasyPost from '@easypost/api';
import camelcaseKeysDeep from 'camelcase-keys-deep';
import { groupBy, sortBy } from 'lodash';
import { Op } from 'sequelize';
import {
  AfterCreate,
  AfterUpdate,
  BeforeCreate,
  BeforeDestroy,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { InventoryStatus } from '../enums/inventory-status.enum';
import { ShipmentDirection } from '../enums/shipment-direction.enum';
import { ShipmentStatus } from '../enums/shipment-status.enum';
import { ShipmentType } from '../enums/shipment-type.enum';
import { ShipmentParcel } from '../types/shipment-parcel.type';
import { ShipmentPostageLabel } from '../types/shipment-postage-label.type';
import { ShipmentRate } from '../types/shipment-rate.type';
import { ShipmentTracker } from '../types/shipment-tracker.type';
import { Address } from './address.entity';
import { Cart } from './cart.entity';
import { Inventory } from './inventory.entity';
import { ShipKit } from './ship-kit.entity';
import { ShipmentInventory } from './shipment-inventory.entity';
import { User } from './user.entity';
import { Warehouse } from './warehouse.entity';
import { Return } from './return.entity';

@ObjectType()
@Table({
  tableName: 'shipments',
  underscored: true,
})
export class Shipment extends Model<Shipment> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field({ nullable: true })
  @Column
  easyPostId?: string;

  @Field()
  @Default(false)
  @Column
  pickup!: boolean;

  @Field()
  @Default(false)
  @Column
  airbox!: boolean;

  @Field()
  @Default(false)
  @Column
  expedited?: boolean;

  @Field(type => ShipmentDirection)
  @Default(ShipmentDirection.OUTBOUND)
  @Column(
    DataType.ENUM({
      values: Object.values(ShipmentDirection),
    }),
  )
  direction!: ShipmentDirection;

  @Field(type => ShipmentType)
  @Default(ShipmentType.ACCESS)
  @Column(
    DataType.ENUM({
      values: Object.values(ShipmentType),
    }),
  )
  type!: ShipmentType;

  @Field(type => ShipmentStatus)
  @Default(ShipmentStatus.PRETRANSIT)
  @Column(
    DataType.ENUM({
      values: Object.values(ShipmentStatus),
    }),
  )
  status!: ShipmentStatus;

  @Field(type => ShipmentParcel, { nullable: true })
  @Column({
    type: 'json',
  })
  parcel?: ShipmentParcel;

  @Field(type => ShipmentRate, { nullable: true })
  @Column({
    type: 'json',
  })
  rate?: ShipmentRate;

  @Field(type => [ShipmentRate], { nullable: true })
  @Column({
    type: 'json',
  })
  rates?: ShipmentRate[];

  @Field(type => ShipmentTracker, { nullable: true })
  @Column({
    type: 'json',
  })
  tracker?: ShipmentTracker;

  @Field(type => ShipmentPostageLabel, { nullable: true })
  @Column({
    type: 'json',
  })
  postage?: ShipmentPostageLabel;

  @Field({ nullable: true })
  @Column
  insurance?: number;

  @Field({ nullable: true })
  @Column
  trackingCode?: string;

  @Field({ nullable: true })
  @Column
  uspsZone?: string;

  @Field({ nullable: true })
  @Column
  refundStatus?: string;

  @Field({ nullable: true })
  @Column
  carrierDeliveredAt?: Date;

  @Field({ nullable: true })
  @Column
  carrierReceivedAt?: Date;

  @Field({ nullable: true })
  @Column
  estDeliveryDate?: Date;

  @Field()
  @Default(12)
  @Column(DataType.FLOAT)
  height!: number;

  @Field()
  @Default(12)
  @Column(DataType.FLOAT)
  length!: number;

  @Field()
  @Default(12)
  @Column(DataType.FLOAT)
  weight!: number;

  @Field()
  @Default(12)
  @Column(DataType.FLOAT)
  width!: number;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => ShipKit)
  @Column(DataType.UUID)
  shipKitId?: string;

  @BelongsTo(() => ShipKit)
  shipKit?: ShipKit;

  @ForeignKey(() => Cart)
  @Column(DataType.UUID)
  cartId?: string;

  @BelongsTo(() => Cart)
  cart?: Cart;

  @ForeignKey(() => Return)
  @Column(DataType.UUID)
  returnId?: string;

  @BelongsTo(() => Return)
  return?: Return;

  @ForeignKey(() => Warehouse)
  @Column(DataType.UUID)
  warehouseId!: string;

  @BelongsTo(() => Warehouse)
  warehouse!: Warehouse;

  @ForeignKey(() => Address)
  @Column(DataType.UUID)
  addressId!: string;

  @BelongsTo(() => Address)
  address!: Address;

  @BelongsToMany(
    () => Inventory,
    () => ShipmentInventory,
  )
  inventory: Inventory[];

  @Field()
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BeforeDestroy
  static async refundShipment(instance: Shipment) {
    const easyPost = new EasyPost(process.env.EASYPOST);

    try {
      const easyPostShipment = await easyPost.Shipment.retrieve(
        instance.easyPostId,
      );

      await easyPostShipment.refund();
    } catch (e) {
      console.log(e);
    }
  }
}
