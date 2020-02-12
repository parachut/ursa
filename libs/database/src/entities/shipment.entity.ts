import * as EasyPost from '@easypost/api';
import * as camelcaseKeysDeep from 'camelcase-keys-deep';
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

  @AfterUpdate
  static async checkDelivered(instance: Shipment) {
    const { models } = instance.sequelize;
    if (
      instance.changed('status') &&
      instance.status === ShipmentStatus.DELIVERED
    ) {
      const inventory = await instance.$get('inventory', {
        include: ['product'],
      });

      if (
        instance.direction === ShipmentDirection.OUTBOUND &&
        instance.type === ShipmentType.ACCESS
      ) {
        await models.Inventory.update(
          {
            status: InventoryStatus.WITHMEMBER,
          },
          {
            where: {
              id: { [Op.in]: inventory.map(item => item.id) },
            },
            individualHooks: true,
          },
        );
      }
    }
  }

  @BeforeCreate
  static async createEasyPostShipment(instance: Shipment) {
    const { models } = instance.sequelize;
    const easyPost = new EasyPost(process.env.EASYPOST);

    let cart: Cart;
    let shipKit: ShipKit;

    if (instance.cartId) {
      cart = await instance.$get('cart');

      if (!instance.addressId) {
        instance.addressId = cart.addressId;
      }

      if (!instance.userId) {
        instance.userId = cart.userId;
      }
    }

    if (instance.shipKitId) {
      shipKit = await instance.$get('shipKit');

      if (!instance.addressId) {
        instance.addressId = shipKit.addressId;
      }

      if (!instance.userId) {
        instance.userId = shipKit.userId;
      }
    }

    if (!instance.warehouseId) {
      const warehouse = (await models.Warehouse.findOne({
        where: {},
        order: [['createdAt', 'desc']],
      })) as Warehouse;

      instance.warehouseId = warehouse.id;
    }

    if (!instance.pickup && !instance.easyPostId) {
      const parcel = new easyPost.Parcel({
        height: instance.height,
        length: instance.length,
        weight: 1,
        width: instance.width,
      });

      const [address, warehouse] = await Promise.all([
        instance.$get('address'),
        instance.$get('warehouse'),
      ]);

      if (!address || !warehouse) {
        throw new Error('Unabled to purchase label without address.');
      }

      const shipment: any = {
        buyer_address: warehouse.easyPostId,
        from_address:
          instance.direction === ShipmentDirection.INBOUND
            ? address.easyPostId
            : warehouse.easyPostId,
        options: {
          delivery_confirmation: 'ADULT_SIGNATURE',
          label_size: '4X6',
          address_validation_level: 0,
        },
        parcel,
        to_address:
          instance.direction === ShipmentDirection.INBOUND
            ? warehouse.easyPostId
            : address.easyPostId,
      };

      const easyPostShipment = new easyPost.Shipment(shipment);

      try {
        await easyPostShipment.save();

        if (easyPostShipment.rates.length > 2) {
          const rates = groupBy(
            easyPostShipment.rates.filter(r => r.delivery_days),
            o => {
              return Number(o.delivery_days);
            },
          );

          const levels = Object.keys(rates).map(Number);
          const level = instance.expedited
            ? rates[levels[0]]
            : rates[levels[1]];

          const uspsExpress = easyPostShipment.rates.find(
            rate => rate.service === 'Express',
          );

          if (uspsExpress) {
            rates[levels[0]].push(uspsExpress);
          }

          const rateSorted = sortBy(level, o => Number(o.rate));

          instance.estDeliveryDate = new Date(rateSorted[0].delivery_date);
          await easyPostShipment.buy(rateSorted[0]);
        } else {
          throw new Error('No rates available');
        }

        await easyPostShipment.convertLabelFormat('ZPL');
      } catch (e) {
        console.log(JSON.stringify(e), 'error');
        throw new Error('Unable to create shipment label.');
      }

      const camalBody = camelcaseKeysDeep(easyPostShipment);

      instance.parcel = JSON.stringify(camalBody.parcel) as any;
      instance.rates = JSON.stringify(camalBody.rates) as any;
      instance.rate = JSON.stringify(camalBody.selectedRate) as any;
      instance.tracker = JSON.stringify(camalBody.tracker) as any;
      instance.postage = JSON.stringify(camalBody.postageLabel) as any;

      instance.easyPostId = camalBody.id;
      instance.trackingCode = camalBody.trackingCode;
      instance.insurance = camalBody.insurance;
      instance.uspsZone = camalBody.uspsZone;
      instance.refundStatus = camalBody.refundStatus;
    }
  }

  @AfterCreate
  static async updateInventory(instance: Shipment) {
    const inventory = await instance.$get('inventory');

    if (inventory && inventory.length) {
      for (const i of inventory) {
        i.status = InventoryStatus.SHIPMENTPREP;
        await i.save();
      }
    }
  }

  @BeforeDestroy
  static async refundShipment(instance: Shipment) {
    const easyPost = new EasyPost(process.env.EASYPOST);

    const easyPostShipment = await easyPost.Shipment.retrieve(
      instance.easyPostId,
    );

    await easyPostShipment.refund();
  }
}
